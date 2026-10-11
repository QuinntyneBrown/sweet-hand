/** Handling reports (handle-reports design, L2-055, L2-034.3–4, L2-060). */
import type { Request, Reply } from '../http/endpoint.ts';
import { conflict, fail, invalid, notFound, ok, refused } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { recordAudit, type AuditEntry } from '../platform/audit.ts';
import { queueEmail } from '../platform/outbox.ts';
import { caterers } from '../caterers/model.ts';
import { enquiries, type Enquiry } from '../enquiries/model.ts';
import { liveUser, users } from '../identity/model.ts';
import { reports, type Report } from '../reports/model.ts';
import { reviews, type Review } from '../reviews/model.ts';
import { areaName } from '../discovery/taxonomy.ts';
import { hiddenByReports } from './queue.ts';
import { stale } from './lifecycle.ts';
import { removeCaterer, suspendCaterer } from './status-actions.ts';
import { certificateView, coverOf, cuisineNames, ownerView, reviewerLabel, trimmed } from './views.ts';
import type { ReportEnquiryView } from '@contract/report-enquiry-view.ts';
import type { ReportGroupView } from '@contract/report-group-view.ts';
import type { ReportedTargetView } from '@contract/reported-target-view.ts';
import type { ResolveReportRequest } from '@contract/resolve-report-request.ts';

/** The reports handled together with this one: the open ones about the same item, or those resolved by the same decision. */
async function reportGroup(tx: Transaction, id: string): Promise<Report[] | null> {
  const report = await reports(tx).get(id);
  if (!report) return null;
  const same = (r: Report) => (report.status === 'Open' ? r.status === 'Open' : r.resolution?.auditId === report.resolution?.auditId);
  return (await reports(tx).find({ targetKind: report.targetKind, targetId: report.targetId }))
    .filter(same)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

/** The enquiry a reported review came from (EnquiryAccessPolicy): the reviewer's enquiry to that caterer. */
async function linkedEnquiry(tx: Transaction, group: Report[]): Promise<Enquiry | null> {
  const first = group[0];
  if (first.targetKind !== 'Review') return null;
  const review = await reviews(tx).get(first.targetId);
  if (!review?.authorUserId) return null;
  const sent = await enquiries(tx).find({ customerId: review.authorUserId, catererId: review.catererId });
  return sent.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

/** How the review is hidden, whichever way it was hidden. */
const hiddenBy = (r: Review): 'reports' | 'operator' | null => (r.status === 'Hidden' ? (hiddenByReports(r) ? 'reports' : 'operator') : null);

async function reportView(tx: Transaction, now: Date, group: Report[]): Promise<ReportGroupView | null> {
  const first = group[0];
  let target: ReportedTargetView;
  if (first.targetKind === 'Review') {
    const review = await reviews(tx).get(first.targetId);
    const c = review && (await caterers(tx).get(review.catererId));
    if (!review || !c) return null;
    target = {
      kind: 'Review',
      reviewId: review.id,
      caterer: { name: c.name, photo: coverOf(c) },
      author: reviewerLabel(review.authorName),
      rating: review.rating,
      text: review.text,
      eventDate: review.eventDate,
      status: review.status,
      hiddenBy: hiddenBy(review),
      hiddenAt: review.status === 'Hidden' ? (review.hiddenAt ?? review.hidden?.at ?? null) : null,
    };
  } else {
    const c = await caterers(tx).get(first.targetId);
    if (!c) return null;
    const cuisine = await cuisineNames(tx);
    target = {
      kind: 'CatererProfile',
      catererId: c.id,
      name: c.name,
      photo: coverOf(c),
      cuisine: cuisine(c.cuisines[0]),
      area: areaName(c.areas[0]),
      owner: (await ownerView(tx, c)).name,
      status: c.status,
      certificate: certificateView(now, c),
    };
  }
  const enquiry = await linkedEnquiry(tx, group);
  const customer = enquiry && (await users(tx).get(enquiry.customerId));
  const enquiryCaterer = enquiry && (await caterers(tx).get(enquiry.catererId));
  const res = first.resolution;
  const resolver = res && (await users(tx).get(res.byUserId));
  return {
    id: first.id,
    status: first.status,
    since: first.createdAt,
    target,
    // Reporters are never named (L2-054.5).
    reports: group.map((r) => ({ reason: r.reason, details: r.details ?? null, at: r.createdAt, signedIn: !!r.reporterUserId })),
    linkedEnquiry:
      enquiry && enquiryCaterer
        ? { customer: customer ? reviewerLabel(customer.displayName) : '', caterer: enquiryCaterer.name, eventDate: enquiry.eventDate, guests: enquiry.guests, status: enquiry.status }
        : null,
    resolution: res ? { at: res.at, by: resolver?.displayName ?? '', outcome: res.outcome, note: res.note, auditId: res.auditId, reporterEmailed: group.some((r) => !!r.reporterUserId) } : null,
  };
}

/** GET /api/operator/reports/:id */
export async function openReport(req: Request): Promise<Reply> {
  const group = await reportGroup(req.tx, req.params['id']);
  const view = group && (await reportView(req.tx, req.now, group));
  return view ? ok(view) : notFound();
}

/** Hides a review from its caterer's page and the rating (L2-059.2). `by` is null when hidden automatically. */
export function hiddenReview(review: Review, by: string | null, reason: string, at: Date, reportCount = 0): Review {
  return { ...review, status: 'Hidden', hidden: { by, reports: reportCount, reason, at: at.toISOString() }, hiddenBy: by ? 'operator' : 'reports', hiddenAt: at.toISOString() };
}

/** Puts a hidden review back on the page. */
export function shownReview(review: Review): Review {
  return { ...review, status: 'Published', hidden: undefined, hiddenBy: undefined, hiddenAt: undefined };
}

async function emailAuthor(req: Request, review: Review, kind: string, reason: string): Promise<void> {
  const author = await liveUser(req.tx, review.authorUserId);
  if (author) await queueEmail(req.tx, req.now, { to: author.email, kind, reason });
}

/** POST /api/operator/reports/:id/resolve — dismiss with a note, or act on the content (L2-055.3–5). */
export async function resolveReport(req: Request): Promise<Reply> {
  const group = await reportGroup(req.tx, req.params['id']);
  if (!group) return notFound();
  const body = (req.body ?? {}) as Partial<ResolveReportRequest>;
  const note = trimmed(body.note);
  const dismiss = body.decision !== 'action';
  if (!note) return invalid({ note: [dismiss ? 'Add a note explaining your decision' : 'Add a reason for this change'] });
  const first = group[0];
  if (first.status !== 'Open') return conflict('This report was already resolved', { status: first.status });
  // Review reports offer hide or remove; profile reports suspend or remove. Anything else is refused, never swapped (handle-reports design).
  const actions = first.targetKind === 'Review' ? ['hide', 'remove-review'] : ['suspend', 'remove'];
  if (!dismiss && !actions.includes(String(body.action))) return invalid({ action: ['Choose an action'] });
  const operatorId = req.actor!.userId;

  let outcome: NonNullable<Report['resolution']>['outcome'];
  let entry: AuditEntry;
  if (dismiss) {
    outcome = 'dismissed';
    const review = first.targetKind === 'Review' ? await reviews(req.tx).get(first.targetId) : undefined;
    // Dismissing undoes automatic hiding (L2-055.3).
    if (review?.status === 'Hidden' && hiddenByReports(review)) await reviews(req.tx).put(shownReview(review));
    entry = await recordAudit(req, { operatorId, action: 'DismissReports', targetType: 'report', targetId: first.id, reason: note, before: { status: 'Open' }, after: { status: 'Resolved', outcome } });
  } else if (first.targetKind === 'Review') {
    const review = await reviews(req.tx).get(first.targetId);
    if (!review || review.status === 'Removed') return notFound();
    const before = { status: review.status };
    if (body.action === 'remove-review') {
      outcome = 'review-removed';
      await reviews(req.tx).put({ ...review, status: 'Removed', text: '', response: undefined, hidden: undefined, hiddenBy: undefined, hiddenAt: undefined });
      entry = await recordAudit(req, { operatorId, action: 'RemoveReview', targetType: 'review', targetId: review.id, reason: note, before, after: { status: 'Removed' } });
      await emailAuthor(req, review, 'review-removed', note);
    } else {
      outcome = 'hidden';
      await reviews(req.tx).put(hiddenReview(review, operatorId, note, req.now, group.length));
      entry = await recordAudit(req, { operatorId, action: 'HideReview', targetType: 'review', targetId: review.id, reason: note, before, after: { status: 'Hidden' } });
      await emailAuthor(req, review, 'review-hidden', note);
    }
  } else {
    const c = (await caterers(req.tx).get(first.targetId)) ?? fail(notFound());
    if (body.action === 'remove') {
      outcome = 'removed';
      entry = (await removeCaterer(req, c, note)).entry;
    } else {
      if (c.status !== 'Published') return stale(c);
      outcome = 'suspended';
      entry = (await suspendCaterer(req, c, note)).entry;
    }
  }
  // The resolution itself is in the log too, linked to the action's entry (L2-060).
  if (!dismiss) {
    await recordAudit(req, { operatorId, action: 'ResolveReports', targetType: 'report', targetId: first.id, reason: note, before: { status: 'Open' }, after: { status: 'Resolved', outcome, actionAuditEntryId: entry.id } });
  }
  const resolution = { at: req.now.toISOString(), byUserId: operatorId, outcome, note, auditId: entry.id };
  const resolved = group.map((r): Report => ({ ...r, status: 'Resolved', resolution }));
  for (const r of resolved) {
    await reports(req.tx).put(r);
    // Reporters hear that it was reviewed, never what was done (L2-055.5).
    const reporter = await liveUser(req.tx, r.reporterUserId);
    if (reporter) await queueEmail(req.tx, req.now, { to: reporter.email, kind: 'report-reviewed' });
  }
  return ok(await reportView(req.tx, req.now, resolved));
}

/** POST /api/operator/reports/:id/enquiry — read-only access to a linked enquiry, only while handling its report, always audited (L2-034.3–4). */
export async function openLinkedEnquiry(req: Request): Promise<Reply> {
  const group = await reportGroup(req.tx, req.params['id']);
  if (!group) return notFound();
  const reason = trimmed(req.body?.reason);
  if (!reason) return invalid({ reason: ['Add a reason for opening this enquiry'] });
  // Only while the report is still being handled (L2-034.3).
  if (group[0].status !== 'Open') return refused(group[0].id);
  const enquiry = await linkedEnquiry(req.tx, group);
  if (!enquiry) return refused(group[0].id);
  await recordAudit(req, { operatorId: req.actor!.userId, action: 'EnquiryAccess', targetType: 'enquiry', targetId: enquiry.id, reason, before: null, after: { reportId: group[0].id } });
  const customer = await users(req.tx).get(enquiry.customerId);
  const caterer = await caterers(req.tx).get(enquiry.catererId);
  const view: ReportEnquiryView = {
    customer: customer ? reviewerLabel(customer.displayName) : '',
    caterer: caterer?.name ?? '',
    eventDate: enquiry.eventDate,
    guests: enquiry.guests,
    status: enquiry.status,
    message: enquiry.message,
    sentAt: enquiry.createdAt,
    entries: enquiry.events.filter((e) => e.kind === 'reply' && e.by !== 'system').map((e) => ({ id: e.id, from: e.by as 'customer' | 'caterer', text: e.text ?? '', at: e.at })),
  };
  return ok(view);
}

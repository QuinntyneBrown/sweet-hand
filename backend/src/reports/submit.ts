import type { Request, Reply } from '../http/endpoint.ts';
import { conflict, invalid, problem } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { validChallenge } from '../platform/bot-challenge.ts';
import { hashIp } from '../platform/secrets.ts';
import { recordSecurityEvent } from '../platform/security-log.ts';
import { recentEvents, recordEvent } from '../platform/throttle.ts';
import type { ReportDuplicate } from '@contract/report-duplicate.ts';
import type { ReportReason } from '@contract/report-reason.ts';
import type { ReportRequest } from '@contract/report-request.ts';
import { caterers } from '../caterers/model.ts';
import { length, text } from '../identity/registration.ts';
import { reviews } from '../reviews/model.ts';
import { reports, type Report, type ReportTargetKind } from './model.ts';

const REASONS: ReportReason[] = ['Inaccurate information', 'Inappropriate content', 'Fake or spam', 'Food safety concern', 'Other'];
const HOUR = 60 * 60_000;
/** Reports one connection may send in a rolling hour (L2-054.3). */
const REPORTS_PER_HOUR = 5;
export const REPORT_KIND = 'report';

/** The stored id of a published caterer (by slug) or a published review (by id); nothing else can be reported. */
async function targetOf(tx: Transaction, kind: unknown, id: unknown): Promise<{ kind: ReportTargetKind; id: string } | undefined> {
  if (typeof id !== 'string' || !id) return undefined;
  if (kind === 'CatererProfile') {
    const c = await caterers(tx).findOne({ slug: id });
    return c?.status === 'Published' ? { kind, id: c.id } : undefined;
  }
  if (kind === 'Review') {
    const r = await reviews(tx).get(id);
    return r?.status === 'Published' ? { kind, id: r.id } : undefined;
  }
  return undefined;
}

/** "R-2105": one more than the highest report number so far. */
export async function nextReportId(tx: Transaction): Promise<string> {
  const numbers = (await reports(tx).all()).map((r) => Number(/^R-(\d+)$/.exec(r.id)?.[1] ?? 0));
  return `R-${Math.max(2099, ...numbers) + 1}`;
}

const WEEK = 7 * 24 * HOUR;
/** Distinct signed-in reporters within 7 days that hide a review until an operator resolves the reports (L2-055.2). */
const HIDING_REPORTERS = 3;

/** Open reports on the review from 3 different signed-in users in the last 7 days hide it automatically. */
async function hideAfterReports(tx: Transaction, now: Date, reviewId: string): Promise<void> {
  const recent = (await reports(tx).find({ targetId: reviewId, status: 'Open' })).filter((r) => r.reporterUserId && now.getTime() - Date.parse(r.createdAt) <= WEEK);
  const reporters = new Set(recent.map((r) => r.reporterUserId)).size;
  if (reporters < HIDING_REPORTERS) return;
  const review = await reviews(tx).get(reviewId);
  if (review?.status !== 'Published') return;
  const at = now.toISOString();
  await reviews(tx).put({ ...review, status: 'Hidden', hiddenBy: 'reports', hiddenAt: at, hidden: { by: null, reports: reporters, reason: '', at } });
}

/** POST /api/reports (report-content design): anyone may report a published caterer or review. */
export async function submitReport(req: Request): Promise<Reply> {
  const recent = await recentEvents(req.tx, REPORT_KIND, req.ip, req.now, HOUR);
  if (recent.length >= REPORTS_PER_HOUR) {
    await recordSecurityEvent(req, 'rate-limit-block');
    const retryAfter = Math.max(1, Math.ceil((Date.parse(recent[0]) + HOUR - req.now.getTime()) / 1000));
    return { ...problem(429, 'Too many reports from this connection'), headers: { 'retry-after': String(retryAfter) } };
  }
  const body = (req.body ?? {}) as Partial<ReportRequest>;
  const reporterUserId = req.actor?.userId;
  // Anonymous reports pass the bot-protection challenge (L2-082.2).
  if (!reporterUserId && !validChallenge(body.challengeToken, 'report')) return invalid({ challengeToken: ['Complete the check'] });

  const errors: Record<string, string[]> = {};
  const reason = REASONS.find((r) => r === body.reason);
  if (!reason) errors['reason'] = ['Choose a reason'];
  const details = text(body.details);
  if (reason === 'Other' && !details) errors['details'] = ['Tell us what’s wrong'];
  if (length(details) > 1000) errors['details'] = ['Keep the details to 1,000 characters or fewer'];
  if (Object.keys(errors).length) return invalid(errors);

  const target = await targetOf(req.tx, body.targetKind, body.targetId);
  if (!target) return invalid({ targetId: ['This can no longer be reported'] });

  if (reporterUserId) {
    const open = (await reports(req.tx).find({ reporterUserId, targetId: target.id, status: 'Open' }))[0];
    if (open) {
      const duplicate: ReportDuplicate = { title: 'You’ve already reported this', reportedAt: open.createdAt };
      return conflict(duplicate.title, { reportedAt: duplicate.reportedAt });
    }
  }

  const report: Report = {
    id: await nextReportId(req.tx),
    targetKind: target.kind,
    targetId: target.id,
    reason: reason!,
    ...(details ? { details } : {}),
    ...(reporterUserId ? { reporterUserId } : {}),
    connection: hashIp(req.ip),
    createdAt: req.now.toISOString(),
    status: 'Open',
  };
  await reports(req.tx).put(report);
  await recordEvent(req.tx, REPORT_KIND, req.ip, req.now, HOUR);
  if (target.kind === 'Review') await hideAfterReports(req.tx, req.now, target.id);
  return { status: 201, body: { id: report.id } };
}

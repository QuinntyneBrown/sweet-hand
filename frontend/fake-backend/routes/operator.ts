import { randomUUID } from 'node:crypto';
import type { Router } from '../lib/router.ts';
import type { Ctx, Reply } from '../lib/http.ts';
import { conflict, forbidden, invalid, notFound, ok, unauthorized } from '../lib/http.ts';
import { currentUser, torontoDate, type AuditEntry, type Store } from '../lib/store.ts';
import type { Caterer, ProfileStatus } from '../seed/caterers.ts';
import type { User } from '../seed/users.ts';
import type { Report } from '../seed/reports.ts';
import { ownerFor, type StatusChange } from '../seed/operator.ts';
import { OCCASIONS, slugify } from '../seed/taxonomy.ts';
import type {
  CatererCounts,
  CatererFlag,
  CatererRecordView,
  CatererRowView,
  CaterersPageView,
  CatererStatusFilter,
  CertificateView,
  DecisionResult,
  NameChangeReviewView,
  OwnerView,
  PublicProfileView,
  ReviewHistoryView,
  SubmissionReviewView,
  QueueCounts,
  QueueFilter,
  QueueItemView,
  QueuePageView,
  ReportReason,
} from '../../projects/web/src/app/core/api/operator-moderation.models.ts';
import { areaName, cuisineName } from './discovery.ts';
import { ratingSummary, reviewerLabel } from './reviews.ts';

/**
 * Fake endpoints of operator moderation (docs/detailed-designs/moderation):
 * the review queue, profile decisions, caterer records, recent changes and
 * reports. Every route checks the operator role on the server (L2-056.3).
 */

const PAGE_SIZE = 20;
const DAY_MS = 24 * 3600_000;

/** The signed-in operator, or the reply that refuses the request. */
function operator(ctx: Ctx<Store>): User | Reply {
  const user = currentUser(ctx.store, ctx.cookies);
  if (!user) return unauthorized();
  if (user.role !== 'Operator') return forbidden();
  return user;
}

const isReply = (x: User | Reply): x is Reply => !('role' in x);

function page(query: URLSearchParams): number {
  const n = Number(query.get('page') ?? '1');
  return Number.isInteger(n) && n > 0 ? n : 1;
}

function paginate<T>(all: T[], requested: number) {
  const pageCount = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const p = Math.min(requested, pageCount);
  return { items: all.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE), total: all.length, page: p, pageSize: PAGE_SIZE, pageCount };
}

export const coverOf = (c: Caterer): string | null => (c.photos[0] ? `/media/${c.photos[0].file}?w=400&fm=jpeg` : null);

/** Whole days between two instants as calendar days in Toronto. */
function calendarDays(store: Store, since: string): number {
  return Math.round((Date.parse(torontoDate(store.now)) - Date.parse(torontoDate(new Date(since)))) / DAY_MS);
}

/** An item is late once it has waited 3 days or more: the promise made to caterers (L2-039). */
const isLate = (store: Store, since: string) => calendarDays(store, since) >= 3;

// ---------------------------------------------------------------------------
// Review queue (work-review-queue design, L2-047)
// ---------------------------------------------------------------------------

/** When the profile entered review, and whether it came back after changes were requested. */
function submission(store: Store, c: Caterer): { at: string; resubmitted: boolean } {
  const history = store.operator.moderation.history[c.id] ?? [];
  const last = [...history].reverse().find((h) => h.step === 'submitted' || h.step === 'resubmitted');
  return { at: last?.at ?? c.createdAt, resubmitted: last?.step === 'resubmitted' };
}

function reviewTitle(store: Store, reviewId: string): { title: string; catererId: string } | null {
  const review = store.reviews.find((r) => r.id === reviewId);
  const caterer = review && store.caterers.find((c) => c.id === review.catererId);
  if (!review || !caterer) return null;
  return { title: `Review of ${caterer.name} by ${reviewerLabel(review.authorName)}`, catererId: caterer.id };
}

/** Open reports grouped by the item they are about (L2-055.1), oldest report first. */
export function reportGroups(store: Store, status: 'Open' | 'any' = 'Open'): Report[][] {
  const groups = new Map<string, Report[]>();
  for (const r of [...store.reports].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    if (status === 'Open' && r.status !== 'Open') continue;
    const key = `${r.targetKind}:${r.targetId}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.values()];
}

export function queueItems(store: Store): QueueItemView[] {
  const m = store.operator.moderation;
  const today = torontoDate(store.now);
  const items: QueueItemView[] = [];
  const base = (id: string, targetId: string, title: string, photo: string | null, waitingSince: string) => ({
    id,
    targetId,
    title,
    photo,
    waitingSince,
    late: isLate(store, waitingSince),
  });

  for (const c of store.caterers) {
    if (c.status === 'Pending review') {
      const s = submission(store, c);
      items.push({
        ...base(`profile:${c.id}`, c.id, c.name, coverOf(c), s.at),
        kind: s.resubmitted ? 'resubmitted' : 'profile',
        cuisine: cuisineName(store, c.cuisines[0]),
        area: areaName(store, c.areas[0]),
      });
    }
    if (c.pendingName && c.status !== 'Removed') {
      items.push({
        ...base(`name:${c.id}`, c.id, c.name, coverOf(c), m.nameRequestedAt[c.id] ?? store.now.toISOString()),
        kind: 'name-change',
        newName: c.pendingName,
        status: c.status,
      });
    }
    if (c.status === 'Published' && c.certificate && c.certificate.expires < today) {
      const detectedAt = m.expiredCertificates[c.id]?.detectedAt ?? `${c.certificate.expires}T09:00:00.000Z`;
      items.push({ ...base(`certificate:${c.id}`, c.id, c.name, coverOf(c), detectedAt), kind: 'certificate', expired: c.certificate.expires, status: c.status });
    }
  }

  for (const group of reportGroups(store)) {
    const first = group[0];
    let title: string | null = null;
    let hidden = false;
    if (first.targetKind === 'Review') {
      title = reviewTitle(store, first.targetId)?.title ?? null;
      hidden = store.reviews.find((r) => r.id === first.targetId)?.hiddenBy === 'reports';
    } else {
      title = store.caterers.find((c) => c.id === first.targetId)?.name ?? null;
    }
    if (!title) continue;
    const reasons = [...new Set(group.map((r) => r.reason))] as ReportReason[];
    items.push({ ...base(`reports:${first.id}`, first.id, title, null, first.createdAt), kind: 'reports', count: group.length, reasons, hidden });
  }

  for (const r of store.reviews.filter((x) => x.status === 'Held')) {
    const t = reviewTitle(store, r.id);
    if (!t) continue;
    items.push({ ...base(`review:${r.id}`, r.id, t.title, null, r.createdAt), kind: 'held-review', holdReason: r.holdReason ?? 'link' });
  }

  return items.sort((a, b) => a.waitingSince.localeCompare(b.waitingSince));
}

const FILTERS: Record<QueueFilter, QueueItemView['kind'][]> = {
  profiles: ['profile', 'resubmitted'],
  'name-changes': ['name-change'],
  certificates: ['certificate'],
  reports: ['reports'],
};

function queueCounts(items: QueueItemView[]): QueueCounts {
  const n = (kinds: QueueItemView['kind'][]) => items.filter((i) => kinds.includes(i.kind)).length;
  return {
    all: items.length,
    profiles: n(FILTERS.profiles),
    nameChanges: n(FILTERS['name-changes']),
    certificates: n(FILTERS.certificates),
    reports: n(FILTERS.reports),
    heldReviews: n(['held-review']),
  };
}

function registerQueue(r: Router<Store>): void {
  r.get('/api/operator/queue', (ctx) => {
    const who = operator(ctx);
    if (isReply(who)) return who;
    const all = queueItems(ctx.store);
    const filter = ctx.query.get('kind') as QueueFilter | null;
    const kinds = filter && FILTERS[filter];
    const matching = kinds ? all.filter((i) => kinds.includes(i.kind)) : all;
    const view: QueuePageView = { ...paginate(matching, page(ctx.query)), counts: queueCounts(all), late: all.filter((i) => i.late).length };
    return ok(view);
  });
}

// ---------------------------------------------------------------------------
// Profile review (work-review-queue + decide-profile-approval designs)
// ---------------------------------------------------------------------------

export function catererOwner(store: Store, c: Caterer): OwnerView {
  const user = c.ownerUserId ? store.users.find((u) => u.id === c.ownerUserId && !u.deleted) : undefined;
  const history = store.operator.moderation.history[c.id] ?? [];
  const since = history.find((h) => h.status === 'Published')?.at ?? c.publishedAt ?? user?.createdAt ?? c.createdAt;
  if (user) return { name: user.displayName, email: user.email, emailVerified: user.emailVerified, phone: user.phone ?? null, since };
  const owner = ownerFor(store.operator.moderation, c.id, c.slug, store.caterers.indexOf(c));
  return { ...owner, emailVerified: true, since };
}

export function certificateView(store: Store, c: Caterer): CertificateView | null {
  const cert = c.certificate;
  if (!cert) return null;
  return {
    holder: cert.holder,
    issuer: cert.issuer,
    number: cert.number,
    expires: cert.expires,
    expired: cert.expires < torontoDate(store.now),
    fileName: cert.fileName ?? null,
    fileSize: cert.fileSize ?? null,
  };
}

const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
export const occasionName = (id: string) => OCCASIONS.find((o) => o.id === id)?.name ?? id;

/** The statuses a caterer's profile went through, oldest first; seeded or derived from its dates. */
export function statusHistory(store: Store, c: Caterer): StatusChange[] {
  const seeded = store.operator.moderation.history[c.id];
  if (seeded) return seeded;
  const owner = catererOwner(store, c).name;
  const derived: StatusChange[] = [{ at: c.createdAt, status: 'Draft', by: owner, step: 'created' }];
  if (c.publishedAt) derived.push({ at: c.publishedAt, status: 'Published', by: 'Leah Mohammed', step: 'approved' });
  store.operator.moderation.history[c.id] = derived;
  return derived;
}

function publicProfile(store: Store, c: Caterer): PublicProfileView {
  const snapshot = store.operator.moderation.snapshots[c.id];
  const now = paragraphs(c.description);
  return {
    name: c.name,
    cuisines: c.cuisines.map((id) => cuisineName(store, id)),
    description: now,
    removedParagraphs: snapshot ? paragraphs(snapshot.description).filter((p) => !now.includes(p)) : [],
    minGuests: c.minGuests,
    maxGuests: c.maxGuests,
    occasions: c.occasions.map(occasionName),
    photos: c.photos.map((p, j) => ({
      id: p.id,
      src: `/media/${p.file}?w=400&fm=jpeg`,
      caption: p.caption,
      cover: j === 0,
      isNew: !!snapshot && !snapshot.photoFiles.includes(p.file),
    })),
    dishes: c.dishes.map((d) => ({ name: d.name, description: d.description ?? null, price: d.price ?? null, tags: d.tags })),
    regions: store.regions
      .map((rg) => ({ name: rg.name, areas: c.areas.filter((id) => rg.areas.some((a) => a.id === id)).map((id) => areaName(store, id)) }))
      .filter((rg) => rg.areas.length > 0),
  };
}

function changedFields(store: Store, c: Caterer): string[] {
  const s = store.operator.moderation.snapshots[c.id];
  if (!s) return [];
  const same = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
  return [
    s.description !== c.description && 'description',
    !same(s.photoFiles, c.photos.map((p) => p.file)) && 'photos',
    !same(s.dishNames, c.dishes.map((d) => d.name)) && 'menu',
    (s.minGuests !== c.minGuests || s.maxGuests !== c.maxGuests) && 'guests',
    !same(s.occasions, c.occasions) && 'occasions',
    !same(s.areas, c.areas) && 'areas',
    !same(s.cuisines, c.cuisines) && 'cuisines',
  ].filter((x): x is string => !!x);
}

function reviewHistory(entries: StatusChange[]): ReviewHistoryView[] {
  return entries
    .map((h): ReviewHistoryView => {
      switch (h.step) {
        case 'created':
          return { at: h.at, step: 'created', by: null, reason: null };
        case 'submitted':
        case 'resubmitted':
          return { at: h.at, step: h.step, by: h.by, reason: null };
        case 'changes-requested':
          return { at: h.at, step: 'changes-requested', by: h.by, reason: h.reason ?? null };
        default:
          return { at: h.at, step: 'published', by: h.by, reason: null };
      }
    })
    .reverse();
}

function submissionReview(store: Store, c: Caterer): SubmissionReviewView {
  const history = statusHistory(store, c);
  const s = submission(store, c);
  const request = s.resubmitted ? [...history].reverse().find((h) => h.step === 'changes-requested') : undefined;
  const changed = s.resubmitted ? changedFields(store, c) : [];
  const owner = catererOwner(store, c);
  const certificate = certificateView(store, c);
  const description = c.description.trim().length;
  return {
    kind: 'submission',
    id: c.id,
    name: c.name,
    status: c.status,
    cover: coverOf(c),
    submittedAt: s.at,
    resubmitted: s.resubmitted,
    changesRequested: request ? { by: request.by, at: request.at, reason: request.reason ?? '' } : null,
    changedFields: changed.length,
    descriptionChanged: changed.includes('description'),
    profile: publicProfile(store, c),
    contact: owner,
    certificate,
    checks: {
      emailVerified: owner.emailVerified,
      photos: c.photos.length,
      photosComplete: c.photos.length >= 3 && c.photos.length <= 30 && c.photos.every((p) => p.caption.trim()),
      dishes: c.dishes.length,
      detailsComplete:
        description >= 50 && description <= 2000 && c.cuisines.length > 0 && c.areas.length > 0 && c.minGuests > 0 && c.occasions.length > 0,
      certificateValid: !!certificate && !certificate.expired,
    },
    history: reviewHistory(history.filter((h) => h.step !== 'reinstated' && h.step !== 'suspended' && h.step !== 'removed')),
  };
}

function nameChangeReview(store: Store, c: Caterer): NameChangeReviewView {
  const owner = catererOwner(store, c).name;
  const requestedAt = store.operator.moderation.nameRequestedAt[c.id] ?? store.now.toISOString();
  const published = [...statusHistory(store, c)].reverse().find((h) => h.step === 'approved' || h.step === 'reinstated');
  const history: ReviewHistoryView[] = [{ at: requestedAt, step: 'name-change-requested', by: owner, reason: null }];
  if (published) history.push({ at: published.at, step: 'published', by: published.by, reason: null });
  return {
    kind: 'name-change',
    id: c.id,
    name: c.name,
    newName: c.pendingName!,
    status: c.status,
    slug: c.slug,
    newSlug: slugify(c.pendingName!.replace(/[’']/g, '')),
    requestedAt,
    requestedBy: owner,
    owner,
    card: {
      photo: coverOf(c) ?? '',
      alt: c.photos[0]?.caption ?? '',
      cuisine: cuisineName(store, c.cuisines[0]),
      area: areaName(store, c.areas[0]),
    },
    history,
  };
}

/** A minimal PDF standing in for the certificate copy. */
const CERTIFICATE_PDF = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n';
const LINK_LIFETIME_MS = 5 * 60_000;

function registerProfileReview(r: Router<Store>): void {
  r.get('/api/operator/queue/profiles/:id', (ctx) => {
    const who = operator(ctx);
    if (isReply(who)) return who;
    const c = ctx.store.caterers.find((x) => x.id === ctx.params['id']);
    if (c?.status === 'Pending review') return ok(submissionReview(ctx.store, c));
    if (c?.pendingName && c.status !== 'Removed') return ok(nameChangeReview(ctx.store, c));
    return notFound();
  });

  /** Redirects to a signed link that stops working after 5 minutes (L2-040.4). */
  r.get('/api/operator/profiles/:id/certificate-file', (ctx) => {
    const who = operator(ctx);
    if (isReply(who)) return who;
    const c = ctx.store.caterers.find((x) => x.id === ctx.params['id']);
    if (!c?.certificate?.fileName) return notFound();
    const token = randomUUID().replace(/-/g, '');
    const expiresAt = new Date(ctx.store.now.getTime() + LINK_LIFETIME_MS).toISOString();
    ctx.store.operator.moderation.certificateLinks[token] = { catererId: c.id, expiresAt };
    return { status: 302, headers: { location: `/api/operator/certificate-files/${token}?expires=${encodeURIComponent(expiresAt)}`, 'cache-control': 'no-store' } };
  });

  /** The link itself is the authorisation; anything else gets 404 (L2-040.4). */
  r.get('/api/operator/certificate-files/:token', (ctx) => {
    const link = ctx.store.operator.moderation.certificateLinks[ctx.params['token']];
    if (!link || Date.parse(link.expiresAt) < ctx.store.now.getTime()) return notFound();
    return { status: 200, raw: CERTIFICATE_PDF, headers: { 'content-type': 'application/pdf', 'cache-control': 'no-store' } };
  });
}

// ---------------------------------------------------------------------------
// Decisions (decide-profile-approval, suspend-reinstate-remove-profile; L2-046, L2-048, L2-060)
// ---------------------------------------------------------------------------

/** Appends an audit entry (L2-060): the log is only ever added to. */
export function audit(
  store: Store,
  operatorUser: User,
  action: string,
  targetType: string,
  targetId: string,
  reason: string | null,
  before: unknown,
  after: unknown,
): AuditEntry {
  const entry: AuditEntry = { id: `audit-${randomUUID()}`, at: store.now.toISOString(), operatorId: operatorUser.id, action, targetType, targetId, reason, before, after };
  store.audit.push(entry);
  return entry;
}

export function email(store: Store, to: string, kind: string, extra: { reason?: string; link?: string } = {}): void {
  store.operator.moderation.emails.push({ to, kind, at: store.now.toISOString(), ...extra });
}

function decision(store: Store, c: Caterer): DecisionResult {
  return { id: c.id, name: c.name, slug: c.slug, status: c.status, owner: catererOwner(store, c).name };
}

/** 409 with the record's current status, so the page can say what changed (L2-046.2–3). */
const stale = (c: Caterer): Reply => conflict('This profile changed', { status: c.status, name: c.name });

/** Records a status change in the history (L2-046.4) and the record's last change. */
export function transition(store: Store, c: Caterer, status: ProfileStatus, by: User, step: StatusChange['step'], reason?: string): void {
  statusHistory(store, c).push({ at: store.now.toISOString(), status, by: by.displayName, step, ...(reason ? { reason } : {}) });
  c.status = status;
  store.operator.moderation.updatedAt[c.id] = store.now.toISOString();
}

const trimmed = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

/** Load the caterer an operator acts on, or the reply refusing it. */
function target(ctx: Ctx<Store>): { who: User; c: Caterer } | Reply {
  const who = operator(ctx);
  if (isReply(who)) return who;
  const c = ctx.store.caterers.find((x) => x.id === ctx.params['id']);
  if (!c) return notFound();
  return { who, c };
}

function registerDecisions(r: Router<Store>): void {
  r.post('/api/operator/profiles/:id/approve', (ctx) => {
    const t = target(ctx);
    if (!('c' in t)) return t;
    const { who, c } = t;
    if (c.status !== 'Pending review') return stale(c);
    const store = ctx.store;
    transition(store, c, 'Published', who, 'approved');
    c.publishedAt ??= store.now.toISOString();
    delete c.statusReason;
    audit(store, who, 'Approve', 'CatererProfile', c.id, null, { status: 'Pending review' }, { status: 'Published' });
    email(store, catererOwner(store, c).email, 'profile-approved', { link: `/caterers/${c.slug}` });
    return ok(decision(store, c));
  });

  r.post('/api/operator/profiles/:id/request-changes', (ctx) => {
    const t = target(ctx);
    if (!('c' in t)) return t;
    const { who, c } = t;
    const reason = trimmed(ctx.body?.reason);
    if ([...reason].length < 10) return invalid({ reason: ['Explain what the caterer needs to change'] });
    if (c.status !== 'Pending review') return stale(c);
    const store = ctx.store;
    store.operator.moderation.snapshots[c.id] = {
      description: c.description,
      photoFiles: c.photos.map((p) => p.file),
      dishNames: c.dishes.map((d) => d.name),
      minGuests: c.minGuests,
      maxGuests: c.maxGuests,
      occasions: [...c.occasions],
      areas: [...c.areas],
      cuisines: [...c.cuisines],
    };
    transition(store, c, 'Changes requested', who, 'changes-requested', reason);
    c.statusReason = reason;
    audit(store, who, 'Request changes', 'CatererProfile', c.id, reason, { status: 'Pending review' }, { status: 'Changes requested' });
    email(store, catererOwner(store, c).email, 'changes-requested', { reason });
    return ok(decision(store, c));
  });

  /** Approving a business-name change: the new name goes live and the old slug redirects (L2-044.3, L2-018.3). */
  r.post('/api/operator/profiles/:id/name/approve', (ctx) => {
    const t = target(ctx);
    if (!('c' in t)) return t;
    const { who, c } = t;
    if (!c.pendingName || c.status === 'Removed') return stale(c);
    const store = ctx.store;
    const before = { name: c.name, slug: c.slug };
    c.previousSlugs.push(c.slug);
    c.name = c.pendingName;
    c.slug = slugify(c.name.replace(/[’']/g, ''));
    delete c.pendingName;
    delete store.operator.moderation.nameRequestedAt[c.id];
    store.operator.moderation.updatedAt[c.id] = store.now.toISOString();
    audit(store, who, 'Approve name change', 'CatererProfile', c.id, null, before, { name: c.name, slug: c.slug });
    email(store, catererOwner(store, c).email, 'name-approved', { link: `/caterers/${c.slug}` });
    return ok(decision(store, c));
  });

  r.post('/api/operator/profiles/:id/name/request-changes', (ctx) => {
    const t = target(ctx);
    if (!('c' in t)) return t;
    const { who, c } = t;
    const reason = trimmed(ctx.body?.reason);
    if ([...reason].length < 10) return invalid({ reason: ['Explain what the caterer needs to change'] });
    if (!c.pendingName) return stale(c);
    const store = ctx.store;
    const requested = c.pendingName;
    delete c.pendingName;
    delete store.operator.moderation.nameRequestedAt[c.id];
    audit(store, who, 'Reject name change', 'CatererProfile', c.id, reason, { name: c.name, requested }, { name: c.name });
    email(store, catererOwner(store, c).email, 'name-change-declined', { reason });
    return ok(decision(store, c));
  });
}

// ---------------------------------------------------------------------------
// Caterer records (suspend-reinstate-remove-profile, edit-profile-as-operator)
// ---------------------------------------------------------------------------

const STATUS_FILTERS: Record<CatererStatusFilter, ProfileStatus> = {
  draft: 'Draft',
  pending: 'Pending review',
  changes: 'Changes requested',
  published: 'Published',
  suspended: 'Suspended',
  removed: 'Removed',
};

/** The record's last change: seeded, or when it was published or created. */
export function lastChange(store: Store, c: Caterer): string {
  return store.operator.moderation.updatedAt[c.id] ?? c.publishedAt ?? c.createdAt;
}

function openReportsAbout(store: Store, c: Caterer): number {
  return store.reports.filter((r) => r.status === 'Open' && r.targetKind === 'CatererProfile' && r.targetId === c.id).length;
}

function catererRow(store: Store, c: Caterer): CatererRowView {
  const openReports = openReportsAbout(store, c);
  const today = torontoDate(store.now);
  const flag: CatererFlag | null = c.pendingName
    ? 'name-change'
    : openReports
      ? 'open-reports'
      : c.status === 'Pending review' && submission(store, c).resubmitted
        ? 'resubmitted'
        : c.status === 'Published' && c.certificate && c.certificate.expires < today
          ? 'certificate-expired'
          : null;
  return {
    id: c.id,
    name: c.name,
    status: c.status,
    photo: coverOf(c),
    cuisine: cuisineName(store, c.cuisines[0]),
    area: areaName(store, c.areas[0]),
    owner: catererOwner(store, c).name,
    updatedAt: lastChange(store, c),
    flag,
    openReports,
  };
}

export function catererRecord(store: Store, c: Caterer): CatererRecordView {
  const m = store.operator.moderation;
  const enquiries = store.enquiries.filter((e) => e.catererId === c.id);
  const history = statusHistory(store, c);
  const lastSuspension = [...history].reverse().find((h) => h.step === 'suspended');
  const removal = [...history].reverse().find((h) => h.step === 'removed');
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    status: c.status,
    photo: coverOf(c),
    pendingName: c.pendingName ?? null,
    owner: catererOwner(store, c),
    profile: {
      photos: c.photos.map((p) => ({ id: p.id, src: `/media/${p.file}?w=400&fm=jpeg`, alt: p.caption })),
      cuisines: c.cuisines.map((id) => cuisineName(store, id)),
      areas: c.areas.map((id) => areaName(store, id)),
      minGuests: c.minGuests,
      maxGuests: c.maxGuests,
      occasions: c.occasions.map(occasionName),
      dishes: c.dishes.map((d) => ({ id: d.id, name: d.name })),
      description: c.description,
    },
    certificate: certificateView(store, c),
    certificateReminders: m.expiredCertificates[c.id]?.reminders ?? [],
    activity: {
      enquiries: enquiries.length,
      openEnquiries: enquiries.filter((e) => e.status === 'Open' || e.status === 'Replied').length,
      rating: ratingSummary(store, c.id),
      openReports: openReportsAbout(store, c),
    },
    history: [...history].reverse().map((h) => ({ at: h.at, status: h.status, by: h.by, step: h.step, reason: h.reason ?? null })),
    suspension: c.status === 'Suspended' && lastSuspension ? { at: lastSuspension.at, closedEnquiries: m.closedBySuspension[c.id] ?? 0 } : null,
    removal: c.status === 'Removed' && removal ? { at: removal.at } : null,
  };
}

function registerCaterers(r: Router<Store>): void {
  r.get('/api/operator/caterers/:id', (ctx) => {
    const t = target(ctx);
    if (!('c' in t)) return t;
    return ok(catererRecord(ctx.store, t.c));
  });

  r.get('/api/operator/caterers', (ctx) => {
    const who = operator(ctx);
    if (isReply(who)) return who;
    const store = ctx.store;
    const status = STATUS_FILTERS[ctx.query.get('status') as CatererStatusFilter] as ProfileStatus | undefined;
    const q = (ctx.query.get('q') ?? '').trim().toLocaleLowerCase('en-CA');
    const all = store.caterers.map((c) => catererRow(store, c)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const found = q ? all.filter((c) => c.name.toLocaleLowerCase('en-CA').includes(q) || c.owner.toLocaleLowerCase('en-CA').includes(q)) : all;
    const matching = status ? found.filter((c) => c.status === status) : found;
    const n = (s: ProfileStatus) => all.filter((c) => c.status === s).length;
    const counts: CatererCounts = {
      all: all.length,
      draft: n('Draft'),
      pending: n('Pending review'),
      changes: n('Changes requested'),
      published: n('Published'),
      suspended: n('Suspended'),
      removed: n('Removed'),
    };
    const other = !matching.length && status && q ? found[0] : undefined;
    const view: CaterersPageView = { ...paginate(matching, page(ctx.query)), counts, otherMatch: other ? { name: other.name, status: other.status } : null };
    return ok(view);
  });
}

/** Closes the caterer's open and replied enquiries and tells each customer (L2-058.2). Returns how many closed. */
function closeEnquiries(store: Store, c: Caterer): number {
  const open = store.enquiries.filter((e) => e.catererId === c.id && (e.status === 'Open' || e.status === 'Replied'));
  for (const e of open) {
    e.status = 'Closed';
    e.events.push({ id: randomUUID(), kind: 'closed', by: 'system', at: store.now.toISOString() });
    const customer = store.users.find((u) => u.id === e.customerId && !u.deleted);
    if (customer) email(store, customer.email, 'caterer-unavailable');
  }
  return open.length;
}

const reasonRequired = () => invalid({ reason: ['Add a reason for this change'] });

function registerStatusActions(r: Router<Store>): void {
  r.post('/api/operator/profiles/:id/suspend', (ctx) => {
    const t = target(ctx);
    if (!('c' in t)) return t;
    const { who, c } = t;
    const reason = trimmed(ctx.body?.reason);
    if (!reason) return reasonRequired();
    if (c.status !== 'Published') return stale(c);
    const store = ctx.store;
    store.operator.moderation.closedBySuspension[c.id] = closeEnquiries(store, c);
    transition(store, c, 'Suspended', who, 'suspended', reason);
    c.statusReason = reason;
    audit(store, who, 'Suspend', 'CatererProfile', c.id, reason, { status: 'Published' }, { status: 'Suspended' });
    email(store, catererOwner(store, c).email, 'caterer-suspended', { reason });
    return ok(decision(store, c));
  });

  r.post('/api/operator/profiles/:id/reinstate', (ctx) => {
    const t = target(ctx);
    if (!('c' in t)) return t;
    const { who, c } = t;
    const reason = trimmed(ctx.body?.reason);
    if (!reason) return reasonRequired();
    if (c.status !== 'Suspended') return stale(c);
    const store = ctx.store;
    transition(store, c, 'Published', who, 'reinstated', reason);
    delete c.statusReason;
    audit(store, who, 'Reinstate', 'CatererProfile', c.id, reason, { status: 'Suspended' }, { status: 'Published' });
    email(store, catererOwner(store, c).email, 'caterer-reinstated', { reason });
    return ok(decision(store, c));
  });

  /** Any status but Removed may be removed; removal is final (L2-046.3, L2-058.4). */
  r.post('/api/operator/profiles/:id/remove', (ctx) => {
    const t = target(ctx);
    if (!('c' in t)) return t;
    const { who, c } = t;
    const reason = trimmed(ctx.body?.reason);
    const errors: Record<string, string[]> = {};
    if (!reason) errors['reason'] = ['Add a reason for this change'];
    if (ctx.body?.confirm !== c.name) errors['confirm'] = [`Type the business name exactly: ${c.name}`];
    if (Object.keys(errors).length) return invalid(errors);
    if (c.status === 'Removed') return stale(c);
    const store = ctx.store;
    const before = c.status;
    closeEnquiries(store, c);
    transition(store, c, 'Removed', who, 'removed', reason);
    c.statusReason = reason;
    audit(store, who, 'Remove', 'CatererProfile', c.id, reason, { status: before }, { status: 'Removed' });
    email(store, catererOwner(store, c).email, 'caterer-removed', { reason });
    return ok(decision(store, c));
  });
}

/** Fake endpoints of the operator area. */
export function registerOperator(r: Router<Store>): void {
  registerStatusActions(r);
  registerCaterers(r);
  registerQueue(r);
  registerProfileReview(r);
  registerDecisions(r);
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

const hoursAgo = (store: Store, hours: number) => new Date(store.now.getTime() - hours * 3600_000).toISOString();

/** Named store changes tests can ask for (`backend.scenario(name, args)`). */
export const operatorScenarios: Record<string, (store: Store, args: any) => unknown> = {
  /** First run: no caterer has registered (admin-caterers/empty). */
  'no-caterers': (store) => {
    store.caterers.length = 0;
  },
  /** Nothing waits for a decision (admin-queue/empty). */
  'empty-review-queue': (store) => {
    for (const c of store.caterers) {
      if (c.status === 'Pending review') c.status = 'Draft';
      delete c.pendingName;
      if (c.certificate && c.certificate.expires < torontoDate(store.now)) c.certificate.expires = '2030-01-01';
    }
    for (const rep of store.reports) rep.status = 'Resolved';
    for (const rev of store.reviews) if (rev.status === 'Held') rev.status = 'Published';
  },
  /** 34 items: 27 more new profiles, 8 of them waiting 4 to 11 days (admin-queue/long). */
  'long-review-queue': (store) => {
    const template = store.caterers.find((c) => c.slug === 'auntie-bevs-kitchen')!;
    for (let i = 0; i < 27; i++) {
      const id = `cat-l${String(i + 1).padStart(2, '0')}`;
      const like = store.caterers[i % 36];
      const at = i < 8 ? hoursAgo(store, (11 - i) * 24) : hoursAgo(store, 1 + i);
      store.caterers.push({
        ...template,
        id,
        slug: `sample-kitchen-${i + 1}`,
        name: `Sample Kitchen ${i + 1}`,
        cuisines: like.cuisines,
        areas: like.areas,
        photos: [{ ...like.photos[0], id: `${id}-photo-1` }],
        previousSlugs: [],
      });
      store.operator.moderation.history[id] = [{ at, status: 'Pending review', by: 'Sample Owner', step: 'submitted' }];
    }
  },
  /** A review held back by the automatic checks (L2-050.3): { caterer, author, holdReason }. */
  'hold-review': (store, { caterer, author, holdReason }: { caterer: string; author: string; holdReason: 'phone' | 'email' | 'link' }) => {
    const c = store.caterers.find((x) => x.slug === caterer)!;
    store.reviews.push({
      id: `review-held-${store.reviews.length + 1}`,
      catererId: c.id,
      authorName: author,
      rating: 5,
      text: 'Lovely food. Call me on 416-555-0199 if you want the recipe.',
      eventDate: '2026-09-26',
      createdAt: hoursAgo(store, 2),
      status: 'Held',
      holdReason,
    });
  },
  /** A visitor reports a caterer now: { caterer, reason }. Returns the report id. */
  'new-report': (store, { caterer, reason }: { caterer: string; reason: Report['reason'] }) => {
    const c = store.caterers.find((x) => x.slug === caterer)!;
    const id = `R-${2100 + store.reports.length}`;
    store.reports.push({ id, targetKind: 'CatererProfile', targetId: c.id, reason, details: 'Two guests were unwell the next day.', createdAt: store.now.toISOString(), status: 'Open' });
    return { id };
  },
};

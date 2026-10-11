import type { Router } from '../lib/router.ts';
import type { AuditEntry as StoredAuditEntry } from '../lib/store.ts';
import { conflict, forbidden, invalid, notFound, ok, unauthorized, type Ctx, type Reply } from '../lib/http.ts';
import { currentUser, newId, torontoDate, type Store } from '../lib/store.ts';
import type { User } from '../seed/users.ts';
import type { Review } from '../seed/reviews.ts';
import { KNOWN_TARGETS, longAudit, type DailyMetrics, type InvitedOperator } from '../seed/operator-settings.ts';
import type { EnquiryMetrics, Granularity, MetricsBucket, MetricsReport } from '../../projects/web/src/app/core/api/metrics.models.ts';
import { slugify, type Cuisine } from '../seed/taxonomy.ts';
import type {
  AddCuisineRequest,
  AddOperatorRequest,
  AdminOnlyProblem,
  AuditEntry,
  AuditEntryView,
  AuditPage,
  BreachInformation,
  BreachRecord,
  CuisineUsage,
  ModeratedReview,
  ModerateReviewRequest,
  ModerationAction,
  ModerationList,
  ModerationStatus,
  OperatorAccount,
  OperatorCuisine,
  RecordBreachRequest,
} from '../../projects/web/src/app/core/api/operator-settings.models.ts';

/**
 * Fake endpoints of the operator console's settings and moderation screens:
 * cuisines, breach register, operator accounts, audit log, review moderation
 * and metrics (docs/detailed-designs/{discovery,moderation,metrics,privacy}).
 */

/** The signed-in operator, or the reply that refuses the request (L2-056.3). */
function operator(ctx: Ctx<Store>): User | Reply {
  const user = currentUser(ctx.store, ctx.cookies);
  if (!user) return unauthorized();
  if (user.role !== 'Operator') return forbidden();
  return user;
}

const isReply = (x: User | Reply): x is Reply => 'status' in x;

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'en-CA');

function cuisineView(store: Store, c: Cuisine): OperatorCuisine {
  const addedBy = store.operatorSettings.cuisineAddedBy[c.id];
  return {
    id: c.id,
    name: c.name,
    retired: c.retired,
    addedAt: c.addedAt,
    addedBy: addedBy ? (store.users.find((u) => u.id === addedBy)?.displayName ?? null) : null,
    retiredAt: store.operatorSettings.cuisineRetiredAt[c.id] ?? null,
    publishedCaterers: store.caterers.filter((x) => x.status === 'Published' && x.cuisines.includes(c.id)).length,
  };
}

/** Appends to the audit log in the same step as the action (L2-060). */
export function audit(store: Store, operatorId: string, action: string, targetType: string, targetId: string, reason: string, before: string | null, after: string | null): void {
  store.audit.push({ id: `aud-${newId()}`, at: store.now.toISOString(), operatorId, action, targetType, targetId, reason, before, after });
}

/** Case- and accent-insensitive comparison key, so "HAÏTIAN" matches "Haitian". */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

export function registerOperatorSettings(r: Router<Store>): void {
  registerBreaches(r);
  registerAccounts(r);
  registerAudit(r);
  registerModeration(r);
  registerMetrics(r);
  r.get('/api/operator/cuisines', (ctx) => {
    const me = operator(ctx);
    if (isReply(me)) return me;
    return ok([...ctx.store.cuisines].sort(byName).map((c) => cuisineView(ctx.store, c)));
  });

  /** L2-007.4: a new cuisine is selectable and offered by the filter straight away. */
  r.post('/api/operator/cuisines', (ctx) => {
    const me = operator(ctx);
    if (isReply(me)) return me;
    const store = ctx.store;
    const name = String((ctx.body as Partial<AddCuisineRequest> | undefined)?.name ?? '').replace(/\s+/g, ' ').trim();
    if (!name) return invalid({ name: ['Enter a cuisine name'] });
    if (name.length < 2 || name.length > 40) return invalid({ name: ['Use 2 to 40 characters'] });
    const existing = store.cuisines.find((c) => fold(c.name) === fold(name) || c.id === slugify(name));
    if (existing) return invalid({ name: [`${existing.name} is already on the list`] });
    const cuisine: Cuisine = { id: slugify(name), name, retired: false, addedAt: store.now.toISOString() };
    store.cuisines.push(cuisine);
    store.operatorSettings.cuisineAddedBy[cuisine.id] = me.id;
    audit(store, me.id, 'AddCuisine', 'cuisine', cuisine.id, 'Added to the cuisine list', null, name);
    return ok(cuisineView(store, cuisine), 201);
  });

  /** The published caterers that use a cuisine, for the retire warning (L2-007.5). */
  r.get('/api/operator/cuisines/:id/usage', (ctx) => {
    const me = operator(ctx);
    if (isReply(me)) return me;
    const cuisine = ctx.store.cuisines.find((c) => c.id === ctx.params['id']);
    return cuisine ? ok(usage(ctx.store, cuisine)) : notFound();
  });

  /** Retiring is permanent and idempotent; caterers who use it keep it (L2-007.5). */
  r.post('/api/operator/cuisines/:id/retire', (ctx) => {
    const me = operator(ctx);
    if (isReply(me)) return me;
    const store = ctx.store;
    const cuisine = store.cuisines.find((c) => c.id === ctx.params['id']);
    if (!cuisine) return notFound();
    if (!cuisine.retired) {
      cuisine.retired = true;
      store.operatorSettings.cuisineRetiredAt[cuisine.id] = store.now.toISOString();
      audit(store, me.id, 'RetireCuisine', 'cuisine', cuisine.id, 'Retired from the cuisine list', 'Active', 'Retired');
    }
    return ok(usage(store, cuisine));
  });
}

const INFORMATION: BreachInformation[] = ['Names', 'Email addresses', 'Phone numbers', 'Event details', 'Messages', 'Food handler certificates'];

/** "Names, email addresses and messages." */
function informationLine(info: BreachInformation[]): string {
  if (!info.length) return 'None identified.';
  const words = info.map((x, i) => (i === 0 ? x : x.charAt(0).toLowerCase() + x.slice(1)));
  return `${new Intl.ListFormat('en-CA', { style: 'long', type: 'conjunction' }).format(words)}.`;
}

/** L2-075.2: a breach record holds the date, description, data and people affected, risk and decision. */
function registerBreaches(r: Router<Store>): void {
  r.get('/api/operator/breaches', (ctx) => {
    const me = operator(ctx);
    if (isReply(me)) return me;
    return ok([...ctx.store.operatorSettings.breaches].sort((a, b) => b.confirmedOn.localeCompare(a.confirmedOn) || b.recordedAt.localeCompare(a.recordedAt)));
  });

  r.post('/api/operator/breaches', (ctx) => {
    const me = operator(ctx);
    if (isReply(me)) return me;
    const store = ctx.store;
    const body = (ctx.body ?? {}) as Partial<RecordBreachRequest>;
    const errors: Record<string, string[]> = {};
    const date = String(body.date ?? '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors['date'] = ['Enter the date the breach was confirmed'];
    else if (date > torontoDate(store.now)) errors['date'] = ['The date can’t be in the future'];
    const what = String(body.what ?? '').trim();
    if (!what) errors['what'] = ['Describe what happened'];
    const people = String(body.people ?? '').trim();
    if (!/^\d+$/.test(people)) errors['people'] = ['Enter the number of people affected as a whole number'];
    if (body.risk !== 'low' && body.risk !== 'real') errors['risk'] = ['Choose the risk of significant harm'];
    if (body.decision !== 'report' && body.decision !== 'not') errors['decision'] = ['Choose a notification decision'];
    if (Object.keys(errors).length) return invalid(errors);
    const info = (body.information ?? []).filter((x) => INFORMATION.includes(x));
    const notes = String(body.riskNotes ?? '').trim();
    const record: BreachRecord = {
      id: `br-${newId()}`,
      title: what,
      confirmedOn: date,
      recordedAt: store.now.toISOString(),
      recordedBy: me.displayName,
      information: informationLine(info),
      peopleAffected: Number(people),
      riskAssessment: `${body.risk === 'real' ? 'Real risk of significant harm.' : 'Low.'}${notes ? ` ${notes.replace(/^(low|real risk of significant harm)[.:]?\s*/i, '')}` : ''}`,
      notificationDecision:
        body.decision === 'report'
          ? 'Reported to the Privacy Commissioner; the people affected are being notified.'
          : 'Not reportable: no real risk of significant harm.',
    };
    store.operatorSettings.breaches.push(record);
    audit(store, me.id, 'RecordBreach', 'breach', record.id, 'Recorded in the breach register', null, record.title);
    return ok(record, 201);
  });
}

/** An Admin, or 403 naming who to ask; the refusal is a security event (L2-056.3, L2-056.5). */
function admin(ctx: Ctx<Store>): User | Reply {
  const me = operator(ctx);
  if (isReply(me) || me.admin) return me;
  ctx.store.operatorSettings.securityEvents.push({ at: ctx.store.now.toISOString(), userId: me.id, path: ctx.path });
  const admins = ctx.store.users.filter((u) => u.role === 'Operator' && u.admin && !u.deleted).map((u) => u.displayName);
  const body: AdminOnlyProblem = { title: 'Only Admins can do this', admins };
  return { status: 403, body };
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase())
    .slice(0, 2)
    .join('');

function lastActive(store: Store, userId: string): string | null {
  const seen = store.account.sessions.filter((s) => s.userId === userId).map((s) => s.lastActiveAt);
  const fallback = store.operatorSettings.lastActive[userId];
  return [...seen, ...(fallback ? [fallback] : [])].sort().at(-1) ?? null;
}

function accountView(store: Store, user: User, me: User): OperatorAccount {
  const deactivatedAt = store.operatorSettings.deactivated[user.id] ?? null;
  return {
    id: user.id,
    name: user.displayName,
    initials: initialsOf(user.displayName),
    email: user.email,
    admin: !!user.admin,
    secondFactor: user.secondFactor ?? null,
    status: deactivatedAt ? 'Deactivated' : 'Active',
    lastActiveAt: user.id === me.id ? store.now.toISOString() : lastActive(store, user.id),
    deactivatedAt,
    self: user.id === me.id,
  };
}

function invitationView(store: Store, invite: InvitedOperator): OperatorAccount {
  const deactivatedAt = store.operatorSettings.deactivated[invite.id] ?? null;
  return {
    id: invite.id,
    name: invite.name,
    initials: initialsOf(invite.name),
    email: invite.email,
    admin: invite.admin,
    secondFactor: null,
    status: deactivatedAt ? 'Deactivated' : 'Invited',
    invitedAt: invite.invitedAt,
    deactivatedAt,
    self: false,
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** manage-operator-accounts: only an Admin creates or deactivates operators (L2-056). */
function registerAccounts(r: Router<Store>): void {
  r.get('/api/operator/accounts', (ctx) => {
    const me = admin(ctx);
    if (isReply(me)) return me;
    const store = ctx.store;
    const users = store.users.filter((u) => u.role === 'Operator' && (!u.deleted || store.operatorSettings.deactivated[u.id]));
    const rank = (a: OperatorAccount) => (a.status === 'Active' ? 0 : a.status === 'Invited' ? 1 : 2);
    const all = [...users.map((u) => accountView(store, u, me)), ...store.operatorSettings.invitations.map((i) => invitationView(store, i))];
    return ok(all.sort((a, b) => rank(a) - rank(b) || byName(a, b)));
  });

  r.post('/api/operator/accounts', (ctx) => {
    const me = admin(ctx);
    if (isReply(me)) return me;
    const store = ctx.store;
    const body = (ctx.body ?? {}) as Partial<AddOperatorRequest>;
    const name = String(body.name ?? '').replace(/\s+/g, ' ').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const errors: Record<string, string[]> = {};
    if (!name) errors['name'] = ['Enter their full name'];
    if (!email) errors['email'] = ['Enter their work email'];
    else if (!EMAIL.test(email)) errors['email'] = ['Enter an email address like name@example.com'];
    else if (store.users.some((u) => u.email.toLowerCase() === email && !u.deleted) || store.operatorSettings.invitations.some((i) => i.email === email))
      errors['email'] = ['This email already has a Sweet Hand account'];
    if (body.role !== 'operator' && body.role !== 'admin') errors['role'] = ['Choose a role'];
    if (Object.keys(errors).length) return invalid(errors);
    const invite: InvitedOperator = { id: `op-${newId()}`, name, email, admin: body.role === 'admin', invitedAt: store.now.toISOString() };
    store.operatorSettings.invitations.push(invite);
    audit(store, me.id, 'CreateOperator', 'operator', invite.id, 'Invited to the operator team', null, invite.admin ? 'Admin' : 'Operator');
    return ok(invitationView(store, invite), 201);
  });

  /** L2-056.4: the operator's sessions end at once, and they can't sign in again. */
  r.post('/api/operator/accounts/:id/deactivate', (ctx) => {
    const me = admin(ctx);
    if (isReply(me)) return me;
    const store = ctx.store;
    const id = ctx.params['id'];
    if (id === me.id) return conflict('You can’t deactivate your own account');
    const user = store.users.find((u) => u.id === id && u.role === 'Operator');
    const invite = store.operatorSettings.invitations.find((i) => i.id === id);
    if (!user && !invite) return notFound();
    if (!store.operatorSettings.deactivated[id]) {
      store.operatorSettings.deactivated[id] = store.now.toISOString();
      if (user) {
        user.deleted = true;
        for (const [token, userId] of [...store.sessions]) if (userId === id) store.sessions.delete(token);
        store.account.sessions = store.account.sessions.filter((s) => s.userId !== id);
      }
      audit(store, me.id, 'DeactivateOperator', 'operator', id, 'Operator account deactivated', user ? (user.admin ? 'Admin' : 'Operator') : 'Invited', 'Deactivated');
    }
    return ok(user ? accountView(store, user, me) : invitationView(store, invite!));
  });
}

const ACTION_GROUPS: Record<string, string[]> = {
  'resolve-report': ['DismissReports', 'ResolveReports'],
  'operator-account': ['CreateOperator', 'DeactivateOperator'],
  cuisines: ['AddCuisine', 'RetireCuisine'],
};

/** "Devon W." */
function shortName(full: string): string {
  const [first, ...rest] = full.split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0]}.` : first;
}

/** What an Admin reads as the target of an entry. */
function targetLabel(store: Store, e: StoredAuditEntry): string {
  const caterer = (id: string) => store.caterers.find((c) => c.id === id)?.name;
  switch (e.targetType) {
    case 'caterer':
      return caterer(e.targetId) ?? KNOWN_TARGETS[e.targetId] ?? e.targetId;
    case 'review': {
      const review = store.reviews.find((x) => x.id === e.targetId);
      return review ? `Review of ${caterer(review.catererId) ?? review.catererId} by ${shortName(review.authorName)}` : (KNOWN_TARGETS[e.targetId] ?? e.targetId);
    }
    case 'enquiry': {
      const enquiry = store.enquiries.find((x) => x.id === e.targetId);
      return enquiry ? `Enquiry with ${caterer(enquiry.catererId) ?? enquiry.catererId}` : (KNOWN_TARGETS[e.targetId] ?? e.targetId);
    }
    case 'report': {
      const report = store.reports.find((x) => x.id === e.targetId);
      if (!report) return KNOWN_TARGETS[e.targetId] ?? e.targetId;
      const review = report.targetKind === 'Review' ? store.reviews.find((x) => x.id === report.targetId) : undefined;
      return `Report on ${caterer(review?.catererId ?? report.targetId) ?? report.targetId}`;
    }
    case 'operator':
    case 'user':
      return store.users.find((u) => u.id === e.targetId)?.displayName ?? store.operatorSettings.invitations.find((i) => i.id === e.targetId)?.name ?? e.targetId;
    case 'cuisine':
      return store.cuisines.find((c) => c.id === e.targetId)?.name ?? e.targetId;
    case 'breach':
      return store.operatorSettings.breaches.find((b) => b.id === e.targetId)?.title ?? e.targetId;
    default:
      return KNOWN_TARGETS[e.targetId] ?? e.targetId;
  }
}

/** query-audit-log: Admins filter by operator, action, target and dates; newest first; no edit or delete route (L2-060). */
function registerAudit(r: Router<Store>): void {
  r.get('/api/operator/audit-log', (ctx) => {
    const me = admin(ctx);
    if (isReply(me)) return me;
    const store = ctx.store;
    const q = ctx.query;
    const operatorId = q.get('operator') ?? '';
    const actions = (q.get('action') ?? '').split(',').filter(Boolean).flatMap((a) => ACTION_GROUPS[a] ?? [a]);
    const target = fold(q.get('target') ?? '');
    const from = q.get('from') ?? '';
    const to = q.get('to') ?? '';
    const page = Math.max(1, Number(q.get('page') ?? 1) || 1);
    const pageSize = 20;
    const name = (id: string) => store.users.find((u) => u.id === id)?.displayName ?? id;
    const matching = store.audit
      .map((e): AuditEntryView => ({ ...e, reason: e.reason ?? '', before: asText(e.before), after: asText(e.after), operatorName: name(e.operatorId), targetLabel: targetLabel(store, e) }))
      .filter((e) => !operatorId || e.operatorId === operatorId)
      .filter((e) => !actions.length || actions.includes(e.action))
      .filter((e) => !target || fold(e.targetLabel).includes(target) || fold(e.targetId).includes(target))
      .filter((e) => {
        const day = torontoDate(new Date(e.at));
        return (!from || day >= from) && (!to || day <= to);
      })
      .sort((a, b) => b.at.localeCompare(a.at));
    const operators = store.users.filter((u) => u.role === 'Operator').map((u) => ({ id: u.id, name: u.displayName })).sort(byName);
    const body: AuditPage = {
      entries: matching.slice((page - 1) * pageSize, page * pageSize),
      total: matching.length,
      page,
      pageSize,
      anyEntries: store.audit.length > 0,
      operators,
    };
    return ok(body);
  });
}

const PHONE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g;
const MAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/gi;
const LINK = /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|ca|net|org|io|to|co)(?:\/\S*)?/gi;

/** What the L2-050 check matched, in the order an operator reads it. */
function heldFor(text: string): ModeratedReview['held'] {
  const find = (re: RegExp) => [...text.matchAll(re)].map((m) => ({ start: m.index!, end: m.index! + m[0].replace(/[.,!?)]+$/, '').length }));
  const phones = find(PHONE);
  const mails = find(MAIL);
  const links = find(LINK).filter((l) => !mails.some((m) => l.start < m.end && m.start < l.end));
  const reason = phones.length ? 'phone' : mails.length ? 'email' : 'link';
  return { reason, ranges: [...phones, ...mails, ...links].sort((a, b) => a.start - b.start) };
}

function moderatedView(store: Store, review: Review): ModeratedReview {
  const caterer = store.caterers.find((c) => c.id === review.catererId);
  const hiddenBy = review.hidden?.by ? (store.users.find((u) => u.id === review.hidden!.by)?.displayName ?? null) : null;
  return {
    id: review.id,
    status: review.status as ModerationStatus,
    catererName: caterer?.name ?? review.catererId,
    catererSlug: caterer?.slug ?? '',
    catererPhoto: `/media/${caterer?.photos[0]?.file ?? 'pelau-house.jpg'}?w=400&fm=jpeg`,
    reviewer: shortName(review.authorName),
    rating: review.rating,
    text: review.text,
    eventDate: review.eventDate,
    held: review.status === 'Held' ? heldFor(review.text) : null,
    hidden: review.status === 'Hidden' ? { by: hiddenBy, reports: review.hidden?.reports ?? 0, reason: review.hidden?.reason ?? '' } : null,
    at: review.status === 'Hidden' ? (review.hidden?.at ?? review.createdAt) : review.createdAt,
  };
}

const TRANSITIONS: Record<ModerationAction, { from: Review['status'][]; to: Review['status']; action: string }> = {
  approve: { from: ['Held'], to: 'Published', action: 'ApproveReview' },
  hide: { from: ['Held', 'Published'], to: 'Hidden', action: 'HideReview' },
  restore: { from: ['Hidden'], to: 'Published', action: 'RestoreReview' },
  remove: { from: ['Held', 'Published', 'Hidden'], to: 'Removed', action: 'RemoveReview' },
};

/** moderate-reviews: approve, hide, restore or remove, each with a reason (L2-059). */
function registerModeration(r: Router<Store>): void {
  r.get('/api/operator/reviews', (ctx) => {
    const me = operator(ctx);
    if (isReply(me)) return me;
    const store = ctx.store;
    const status: ModerationStatus = ctx.query.get('status') === 'hidden' ? 'Hidden' : 'Held';
    const q = fold(ctx.query.get('q') ?? '');
    const views = store.reviews.filter((x) => x.status === 'Held' || x.status === 'Hidden').map((x) => moderatedView(store, x));
    const author = (id: string) => fold(store.reviews.find((x) => x.id === id)?.authorName ?? '');
    const reviews = views
      .filter((v) => v.status === status)
      .filter((v) => !q || fold(v.catererName).includes(q) || fold(v.reviewer).includes(q) || author(v.id).includes(q))
      .sort((a, b) => b.at.localeCompare(a.at));
    const body: ModerationList = { held: views.filter((v) => v.status === 'Held').length, hidden: views.filter((v) => v.status === 'Hidden').length, reviews };
    return ok(body);
  });

  r.post('/api/operator/reviews/:id/:action', (ctx) => {
    const me = operator(ctx);
    if (isReply(me)) return me;
    const store = ctx.store;
    const transition = TRANSITIONS[ctx.params['action'] as ModerationAction];
    const review = store.reviews.find((x) => x.id === ctx.params['id']);
    if (!transition || !review) return notFound();
    const reason = String((ctx.body as Partial<ModerateReviewRequest> | undefined)?.reason ?? '').trim();
    if (!reason) return invalid({ reason: ['Add a reason for this decision'] });
    if (!transition.from.includes(review.status)) return conflict('This review has already been moderated', { status: review.status });
    const before = review.status;
    review.status = transition.to;
    if (transition.to === 'Hidden') review.hidden = { by: me.id, reports: 0, reason, at: store.now.toISOString() };
    else delete review.hidden;
    if (transition.to === 'Removed') {
      review.text = '';
      delete review.response;
    }
    audit(store, me.id, transition.action, 'review', review.id, reason, before, transition.to);
    return { status: 204 };
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;
const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T12:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The same day 24 months earlier: the earliest From a range may have (L2-061.2). */
function twoYearsBefore(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${y - 2}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function bucketOf(date: string, granularity: Granularity): string {
  if (granularity === 'day') return date;
  if (granularity === 'month') return `${date.slice(0, 7)}-01`;
  const weekday = (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
  return addDays(date, -weekday);
}

type Range = { from: string; to: string; granularity: Granularity };

/** MetricsRange: a valid range of 24 months or less, up to today (view-metrics-dashboard). */
function metricsRange(ctx: Ctx<Store>): Range | Reply {
  const from = ctx.query.get('from') ?? '';
  const to = ctx.query.get('to') ?? '';
  const g = ctx.query.get('granularity');
  const granularity: Granularity = g === 'day' || g === 'month' ? g : 'week';
  const today = torontoDate(ctx.store.now);
  if (!DATE.test(from)) return invalid({ from: ['Enter a From date'] });
  if (!DATE.test(to)) return invalid({ to: ['Enter a To date'] });
  if (to > today || from > today) return invalid({ [to > today ? 'to' : 'from']: ['Choose dates up to today'] });
  if (from > to) return invalid({ from: ['Choose a From date on or before the To date'] });
  if (from < twoYearsBefore(to)) return invalid({ from: ['Choose a range of 24 months or less'] });
  return { from, to, granularity };
}

function bucketsFor(store: Store, r: Range): { buckets: MetricsBucket[]; days: Map<string, string[]> } {
  const today = torontoDate(store.now);
  const days = new Map<string, string[]>();
  for (let d = r.from; d <= r.to; d = addDays(d, 1)) {
    const key = bucketOf(d, r.granularity);
    days.set(key, [...(days.get(key) ?? []), d]);
  }
  const buckets = [...days.keys()].map((start) => ({ start, current: days.get(start)!.includes(today) || bucketOf(today, r.granularity) === start }));
  return { buckets, days };
}

function dailyBy(store: Store): Map<string, DailyMetrics> {
  return new Map(store.operatorSettings.metrics.map((m) => [m.date, m]));
}

/** Caterers by status at the end of a day: Published from the history, the rest as today. */
function statusesAt(store: Store, date: string): { status: string; count: number }[] {
  const later = store.operatorSettings.metrics.filter((m) => m.date > date).reduce((n, m) => n + m.published, 0);
  return [{ status: 'Published', count: store.operatorSettings.publishedToday - later }, ...store.operatorSettings.otherStatuses];
}

function metricsReport(store: Store, r: Range): MetricsReport {
  const { buckets, days } = bucketsFor(store, r);
  const daily = dailyBy(store);
  const sum = (key: 'listing' | 'caterer' | 'unique' | 'published') => buckets.map((b) => days.get(b.start)!.reduce((n, d) => n + (daily.get(d)?.[key] ?? 0), 0));
  return {
    from: r.from,
    to: r.to,
    granularity: r.granularity,
    countingSince: store.operatorSettings.metricsStart,
    hasData: r.to >= store.operatorSettings.metricsStart,
    buckets,
    listingVisits: sum('listing'),
    catererVisits: sum('caterer'),
    uniqueVisitors: sum('unique'),
    newPublished: sum('published'),
    statuses: statusesAt(store, r.to),
  };
}

function enquiryMetrics(store: Store, r: Range): EnquiryMetrics {
  const { buckets, days } = bucketsFor(store, r);
  const daily = dailyBy(store);
  // An enquiry counts toward the share once 48 hours have passed (view-metrics-dashboard).
  const due = addDays(torontoDate(store.now), -3);
  const tally = (list: string[]) =>
    list.reduce(
      (t, d) => {
        const m = daily.get(d);
        if (!m) return t;
        return { enquiries: t.enquiries + m.enquiries, eligible: t.eligible + (d <= due ? m.enquiries : 0), replied: t.replied + (d <= due ? m.replied : 0) };
      },
      { enquiries: 0, eligible: 0, replied: 0 },
    );
  const share = (t: { eligible: number; replied: number }) => (t.eligible ? Math.round((t.replied / t.eligible) * 100) : null);
  const perBucket = buckets.map((b) => tally(days.get(b.start)!));
  return { buckets, enquiries: perBucket.map((t) => t.enquiries), repliedShare: perBucket.map(share), repliedOverall: share(tally(buckets.flatMap((b) => days.get(b.start)!))) };
}

/** CsvFormulaGuard: a value starting with =, +, -, @, tab or carriage return is read as text; every field is quoted (L2-063.2). */
export function csvField(value: string | number | null): string {
  let text = value === null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** view-metrics-dashboard and export-metrics (L2-061, L2-063). */
function registerMetrics(r: Router<Store>): void {
  r.get('/api/operator/metrics', (ctx) => {
    const me = operator(ctx);
    if (isReply(me)) return me;
    const range = metricsRange(ctx);
    return 'status' in range ? range : ok(metricsReport(ctx.store, range));
  });

  r.get('/api/operator/metrics/enquiries', (ctx) => {
    const me = operator(ctx);
    if (isReply(me)) return me;
    const range = metricsRange(ctx);
    return 'status' in range ? range : ok(enquiryMetrics(ctx.store, range));
  });

  /** One row per bucket, one column per metric and per status; UTF-8, not cacheable (L2-063.1). */
  r.get('/api/operator/metrics/export.csv', (ctx) => {
    const me = operator(ctx);
    if (isReply(me)) return me;
    const range = metricsRange(ctx);
    if ('status' in range) return range;
    const store = ctx.store;
    const report = metricsReport(store, range);
    const enquiries = enquiryMetrics(store, range);
    const statusNames = report.statuses.map((s) => s.status);
    const header = ['Period start', 'Listing page visits', 'Caterer page visits', 'Unique visitors', 'Enquiries', 'Replied within 48 hours (%)', 'New caterers published', ...statusNames];
    const rows = report.buckets.map((b, i) => {
      // Caterers by status at the end of each bucket (export-metrics).
      const last = report.buckets[i + 1] ? addDays(report.buckets[i + 1].start, -1) : range.to;
      const statuses = statusesAt(store, last);
      return [b.start, report.listingVisits[i], report.catererVisits[i], report.uniqueVisitors[i], enquiries.enquiries[i], enquiries.repliedShare[i], report.newPublished[i], ...statuses.map((s) => s.count)];
    });
    const csv = [header, ...rows].map((row) => row.map(csvField).join(',')).join('\r\n') + '\r\n';
    const period = { day: 'daily', week: 'weekly', month: 'monthly' }[range.granularity];
    return {
      status: 200,
      raw: csv,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="sweet-hand-metrics-${range.from}-to-${range.to}-${period}.csv"`,
        'cache-control': 'no-store',
      },
    };
  });
}

function usage(store: Store, cuisine: Cuisine): CuisineUsage {
  const caterers = store.caterers
    .filter((x) => x.status === 'Published' && x.cuisines.includes(cuisine.id))
    .sort(byName)
    .map((x) => ({ name: x.name, slug: x.slug, photo: `/media/${x.photos[0]?.file ?? 'pelau-house.jpg'}?w=400&fm=jpeg` }));
  return { cuisine: cuisineView(store, cuisine), caterers };
}

/** Named store changes tests can ask for (`backend.scenario(name, args)`). */
export const operatorSettingsScenarios: Record<string, (store: Store, args: any) => unknown> = {
  /** docs/mocks/pages/admin-breaches/empty.html */
  'no-breaches': (store) => {
    store.operatorSettings.breaches = [];
  },
  /** docs/mocks/pages/admin-audit/empty.html: a brand-new platform. */
  'audit-empty': (store) => {
    store.audit.length = 0;
  },
  /** docs/mocks/pages/admin-audit/long.html: 1,284 entries over the past year. */
  'audit-long': (store) => {
    store.audit.splice(0, store.audit.length, ...longAudit(store.now));
  },
  /** A stored label that spreadsheet software would run as a formula, for the export's guard (L2-063.2). */
  'metrics-formula-in-data': (store) => {
    store.operatorSettings.otherStatuses[0]!.status = '=HYPERLINK("https://example.com","Pending review")';
  },
  /** docs/mocks/pages/admin-reviews/empty.html: nothing held, nothing hidden. */
  'no-reviews-to-moderate': (store) => {
    for (const review of store.reviews) if (review.status === 'Held' || review.status === 'Hidden') review.status = 'Published';
  },
};

/** Moderation actions store structured before/after values; the audit page shows them as text. */
function asText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
}

import { randomUUID } from 'node:crypto';
import type { Router } from '../lib/router.ts';
import type { Ctx, Reply } from '../lib/http.ts';
import { conflict, forbidden, invalid, notFound, ok, unauthorized } from '../lib/http.ts';
import { currentUser, torontoDate, type Store } from '../lib/store.ts';
import { photoView } from '../lib/views.ts';
import { OCCASIONS } from '../seed/taxonomy.ts';
import type { Enquiry, EnquiryEvent } from '../seed/enquiries.ts';
import type { User } from '../seed/users.ts';
import type {
  ContactDetails,
  EnquiryDraftView,
  EnquiryFormValues,
  EnquiryRefusal,
  EnquiryStatus,
  FitWarning,
  InboxFilter,
  InboxPageView,
  InboxRowView,
  OtherParty,
  Party,
  ReplyResult,
  SendEnquiryRequest,
  SentEnquiryView,
  ThreadEntryView,
  ThreadView,
} from '../../projects/web/src/app/core/api/enquiries.models.ts';

const PAGE_SIZE = 20;
const REPLY_MAX = 2000;
const NOTE_MAX = 500;
const FILTERS: Record<InboxFilter, EnquiryStatus> = { open: 'Open', replied: 'Replied', declined: 'Declined', closed: 'Closed' };

/** Extra state the enquiries area keeps per store, beside the seeded enquiries. */
const delayedEmails = new WeakSet<Store>();
/** The email provider is down: enquiries are still created and the email is queued (L2-030.1, L2-091.1). */
const emailDown = new WeakSet<Store>();
/** Saved drafts per store, keyed `userId caterer-slug` (send-enquiry design, `EnquiryDraft`). */
const drafts = new WeakMap<Store, Map<string, EnquiryDraftView>>();

/** The token the default invisible bot check hands the form (core/api/bot-challenge.ts). */
const CHALLENGE_PASSED = 'invisible-challenge-passed';
const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
const DAILY_LIMIT = 10;
const NEW_ACCOUNT_LIMIT = 3;

// ---------- Rules ------------------------------------------------------------

/** Which side of the enquiry the user is on; `null` when they are not a party (L2-034). */
export function partyOf(user: User, e: Enquiry): Party | null {
  if (user.role === 'Customer' && e.customerId === user.id) return 'customer';
  if (user.role === 'Caterer' && user.catererId === e.catererId) return 'caterer';
  return null;
}

const other = (p: Party): Party => (p === 'customer' ? 'caterer' : 'customer');

/** Times the other party did something the viewer has not seen: creating it, a reply, a decline, a share (show-unread-indicators). */
function activityBy(e: Enquiry, party: Party): string[] {
  const times = e.events.filter((ev) => ev.by === party && ev.kind !== 'closed').map((ev) => ev.at);
  if (party === 'customer') times.push(e.createdAt);
  return times;
}

export function isUnread(e: Enquiry, viewer: Party): boolean {
  const read = e.readAt[viewer];
  return activityBy(e, other(viewer)).some((at) => !read || at > read);
}

export function lastActivityAt(e: Enquiry): string {
  return [e.createdAt, ...e.events.map((ev) => ev.at)].sort().at(-1)!;
}

function liveCustomer(store: Store, e: Enquiry): User | undefined {
  const u = store.users.find((x) => x.id === e.customerId);
  return u && !u.deleted ? u : undefined;
}

/** Enquiries a user is a party to, newest activity first (L2-031). */
export function enquiriesOf(store: Store, user: User): { e: Enquiry; party: Party }[] {
  return store.enquiries
    .map((e) => ({ e, party: partyOf(user, e) }))
    .filter((x): x is { e: Enquiry; party: Party } => x.party !== null)
    .sort((a, b) => lastActivityAt(b.e).localeCompare(lastActivityAt(a.e)) || a.e.id.localeCompare(b.e.id));
}

/** Unread threads for the header badge (L2-029.1). */
export function unreadThreads(store: Store, user: User): number {
  return enquiriesOf(store, user).filter(({ e, party }) => isUnread(e, party)).length;
}

function areaName(store: Store, id: string): string {
  for (const r of store.regions) for (const a of r.areas) if (a.id === id) return a.name;
  return id;
}

const occasionName = (id: string) => OCCASIONS.find((o) => o.id === id)?.name ?? id;

function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words.length > 1 ? words.at(-1)![0] : '')).toUpperCase();
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function otherParty(store: Store, e: Enquiry, viewer: Party): OtherParty {
  if (viewer === 'customer') {
    const c = store.caterers.find((x) => x.id === e.catererId)!;
    return { kind: 'caterer', name: c.name, slug: c.slug, photo: `/media/${c.photos[0].file}?w=400&fm=jpeg` };
  }
  const u = liveCustomer(store, e);
  return u ? { kind: 'customer', name: u.displayName, firstName: u.displayName.split(' ')[0], initials: initials(u.displayName) } : { kind: 'former' };
}

function rowView(store: Store, e: Enquiry, viewer: Party): InboxRowView {
  return {
    id: e.id,
    otherParty: otherParty(store, e, viewer),
    eventDate: e.eventDate,
    guests: e.guests,
    occasion: occasionName(e.occasion),
    status: e.status,
    lastActivityAt: lastActivityAt(e),
    unread: isUnread(e, viewer),
  };
}

function contactOf(store: Store, e: Enquiry, party: Party): ContactDetails | null {
  if (party === 'customer') {
    const u = liveCustomer(store, e);
    return u ? { name: u.displayName, email: u.email, phone: u.phone ?? null } : null;
  }
  const c = store.caterers.find((x) => x.id === e.catererId)!;
  const owner = store.users.find((u) => u.catererId === c.id);
  return { name: c.name, email: c.businessEmail ?? owner?.email ?? '', phone: c.businessPhone ?? owner?.phone ?? null };
}

function fitWarnings(store: Store, e: Enquiry): FitWarning[] {
  const c = store.caterers.find((x) => x.id === e.catererId)!;
  const out: FitWarning[] = [];
  if (e.guests < c.minGuests || e.guests > c.maxGuests) out.push({ kind: 'guests', min: c.minGuests, max: c.maxGuests });
  if (!c.areas.includes(e.area)) out.push({ kind: 'area', area: areaName(store, e.area) });
  return out;
}

function entryView(store: Store, e: Enquiry, ev: EnquiryEvent): ThreadEntryView {
  switch (ev.kind) {
    case 'reply':
      return { kind: 'reply', id: ev.id, from: ev.by as Party, text: ev.text ?? '', at: ev.at };
    case 'declined':
      return { kind: 'declined', id: ev.id, note: ev.note ?? null, at: ev.at };
    case 'closed':
      return { kind: 'closed', id: ev.id, by: ev.by, at: ev.at };
    case 'shared':
      // Details are read from the account now, so a deleted account shares nothing (L2-072.2).
      return { kind: 'shared', id: ev.id, by: ev.by as Party, at: ev.at, contact: contactOf(store, e, ev.by as Party) };
  }
}

function threadView(store: Store, e: Enquiry, viewer: Party): ThreadView {
  const c = store.caterers.find((x) => x.id === e.catererId)!;
  const u = liveCustomer(store, e);
  const active = e.status === 'Open' || e.status === 'Replied';
  const today = torontoDate(store.now);
  return {
    id: e.id,
    viewer,
    status: e.status,
    caterer: { name: c.name, slug: c.slug, photo: `/media/${c.photos[0].file}?w=400&fm=jpeg` },
    customer: u ? { name: u.displayName, firstName: u.displayName.split(' ')[0], initials: initials(u.displayName) } : null,
    eventDate: e.eventDate,
    guests: e.guests,
    area: areaName(store, e.area),
    fsa: e.fsa,
    occasion: occasionName(e.occasion),
    message: e.message,
    sentAt: e.createdAt,
    fitWarnings: viewer === 'caterer' ? (e.fitWarnings ?? fitWarnings(store, e)) : [],
    entries: e.events.map((ev) => entryView(store, e, ev)),
    myContact: contactOf(store, e, viewer) ?? { name: '', email: '', phone: null },
    sharedByMe: e.events.some((ev) => ev.kind === 'shared' && ev.by === viewer),
    closesOn: active && e.eventDate < today ? addDays(e.eventDate, 30) : null,
  };
}

/** Plain text as given, minus control characters other than tab and newline (L2-080.4). */
const clean = (s: unknown) => (typeof s === 'string' ? s.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '') : '');
const length = (s: string) => [...s].length;

// ---------- Sending (send-enquiry, limit-enquiry-abuse) ------------------------

function addMonths(date: string, months: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

/** A Canadian postal code, or just its forward sortation area. */
const POSTAL = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z](?:[ -]?\d[ABCEGHJ-NPRSTV-Z]\d)?$/i;

type FormBody = Partial<Record<keyof EnquiryFormValues, unknown>>;

/** The field rules of L2-022, one message per failing field, keyed by request field. */
function enquiryErrors(store: Store, body: FormBody): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  const today = torontoDate(store.now);
  const date = typeof body.eventDate === 'string' ? body.eventDate : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00Z`))) errors['eventDate'] = ['Choose a date for your event'];
  else if (date < addDays(today, 2)) errors['eventDate'] = ['Choose a date at least 2 days from today'];
  else if (date > addMonths(today, 24)) errors['eventDate'] = ['Choose a date within the next 24 months'];
  const guests = String(body.guests ?? '').trim();
  if (!/^\d+$/.test(guests) || Number(guests) < 1 || Number(guests) > 5000) errors['guests'] = ['Enter a whole number of guests from 1 to 5,000'];
  if (typeof body.area !== 'string' || !store.regions.some((r) => r.areas.some((a) => a.id === body.area))) errors['area'] = ['Choose an area'];
  const postal = typeof body.postalCode === 'string' ? body.postalCode.trim() : '';
  if (postal && !POSTAL.test(postal)) errors['postalCode'] = ['Enter a valid postal code, like M1E 4R8'];
  if (typeof body.occasion !== 'string' || !OCCASIONS.some((o) => o.id === body.occasion)) errors['occasion'] = ['Choose an occasion'];
  const message = clean(body.message).trim();
  if (length(message) < 20) errors['message'] = ['Tell the caterer a little more (at least 20 characters)'];
  else if (length(message) > 2000) errors['message'] = ['Keep your message under 2,000 characters'];
  return errors;
}

function refuse(status: number, code: EnquiryRefusal, title: string, extra: Record<string, unknown> = {}, headers?: Record<string, string>): Reply {
  return { status, body: { title, code, ...extra }, headers };
}

/** The customer's enquiries sent at or after `since` (ms). */
function sentSince(store: Store, user: User, since: number): Enquiry[] {
  return store.enquiries.filter((e) => e.customerId === user.id && new Date(e.createdAt).getTime() >= since);
}

/** New-account, daily and duplicate limits, in that order (limit-enquiry-abuse, `EnquiryLimitPolicy`). */
function limitRefusal(store: Store, user: User, catererId: string, eventDate: string): Reply | null {
  const now = store.now.getTime();
  const created = new Date(user.createdAt).getTime();
  if (now - created < HOUR_MS && sentSince(store, user, created).length >= NEW_ACCOUNT_LIMIT) {
    const retry = String(Math.ceil((created + HOUR_MS - now) / 1000));
    return refuse(429, 'new-account-limit', 'New accounts can send 3 enquiries in their first hour', {}, { 'retry-after': retry });
  }
  const lastDay = sentSince(store, user, now - DAY_MS);
  if (lastDay.length >= DAILY_LIMIT) {
    const oldest = Math.min(...lastDay.map((e) => new Date(e.createdAt).getTime()));
    const retry = String(Math.ceil((oldest + DAY_MS - now) / 1000));
    return refuse(429, 'daily-limit', 'You’ve reached today’s enquiry limit. Try again tomorrow.', {}, { 'retry-after': retry });
  }
  const existing = store.enquiries.find(
    (e) => e.customerId === user.id && e.catererId === catererId && e.eventDate === eventDate && (e.status === 'Open' || e.status === 'Replied'),
  );
  if (existing) return refuse(409, 'duplicate', 'You already have an open enquiry with this caterer for that date', { enquiryId: existing.id });
  return null;
}

function draftsOf(store: Store): Map<string, EnquiryDraftView> {
  let map = drafts.get(store);
  if (!map) drafts.set(store, (map = new Map()));
  return map;
}

const text = (v: unknown) => (typeof v === 'string' ? v : '');

const formValues = (body: FormBody): EnquiryFormValues => ({
  eventDate: text(body.eventDate),
  guests: body.guests === undefined || body.guests === null ? '' : String(body.guests),
  area: text(body.area),
  postalCode: text(body.postalCode),
  occasion: text(body.occasion),
  message: clean(body.message),
});

/** The signed-in customer, or the reply that ends the request (send-enquiry, `RequestPipeline`). */
function customer(ctx: Ctx<Store>): User | Reply {
  const user = currentUser(ctx.store, ctx.cookies);
  if (!user) return unauthorized();
  if (user.role !== 'Customer') return refuse(403, 'customer-only', 'Sign in with a customer account to send enquiries');
  return user;
}

const isUser = (x: User | Reply): x is User => 'role' in x;

function registerSending(r: Router<Store>): void {
  /** Creates an Open enquiry (L2-022, L2-023, L2-024, L2-025). */
  r.post('/api/enquiries', (ctx) => {
    const user = customer(ctx);
    if (!isUser(user)) return user;
    if (!user.emailVerified) return refuse(403, 'email-unverified', 'Verify your email to send enquiries');
    const body = (ctx.body ?? {}) as Partial<SendEnquiryRequest>;
    if (body.challengeToken !== CHALLENGE_PASSED) return refuse(400, 'challenge-failed', 'The bot check failed');
    const c = ctx.store.caterers.find((x) => x.slug === body.catererSlug && x.status === 'Published');
    if (!c) return notFound();
    const errors = enquiryErrors(ctx.store, body);
    if (Object.keys(errors).length) return invalid(errors);
    const values = formValues(body);
    const limit = limitRefusal(ctx.store, user, c.id, values.eventDate);
    if (limit) return limit;

    const now = ctx.store.now.toISOString();
    const postal = values.postalCode.trim().toUpperCase();
    const e: Enquiry = {
      id: randomUUID(),
      customerId: user.id,
      catererId: c.id,
      eventDate: values.eventDate,
      guests: Number(values.guests.trim()),
      area: values.area,
      // Only the forward sortation area is kept (L2-022).
      fsa: postal ? postal.slice(0, 3) : null,
      occasion: values.occasion,
      message: values.message.trim(),
      createdAt: now,
      status: 'Open',
      events: [],
      readAt: { customer: now },
    };
    e.fitWarnings = fitWarnings(ctx.store, e);
    ctx.store.enquiries.push(e);
    draftsOf(ctx.store).delete(`${user.id} ${c.slug}`);
    const owner = ctx.store.users.find((u) => u.catererId === c.id && !u.deleted);
    const view: SentEnquiryView = {
      id: e.id,
      caterer: { name: c.name, slug: c.slug },
      contactName: owner ? owner.displayName.split(/\s+/)[0] : c.name,
      eventDate: e.eventDate,
      guests: e.guests,
      area: areaName(ctx.store, e.area),
      occasion: occasionName(e.occasion),
      emailQueued: emailDown.has(ctx.store),
    };
    return ok(view, 201);
  });

  /** The customer's unsent values for one caterer, kept for 24 hours (L2-023.3); 204 when there are none. */
  r.get('/api/enquiries/drafts/:caterer', (ctx) => {
    const user = customer(ctx);
    if (!isUser(user)) return user;
    const draft = draftsOf(ctx.store).get(`${user.id} ${ctx.params['caterer']}`);
    if (!draft || ctx.store.now.getTime() - new Date(draft.savedAt).getTime() > DAY_MS) return { status: 204 };
    return ok(draft);
  });

  r.put('/api/enquiries/drafts/:caterer', (ctx) => {
    const user = customer(ctx);
    if (!isUser(user)) return user;
    const c = ctx.store.caterers.find((x) => x.slug === ctx.params['caterer'] && x.status === 'Published');
    if (!c) return notFound();
    draftsOf(ctx.store).set(`${user.id} ${c.slug}`, { values: formValues(ctx.body ?? {}), savedAt: ctx.store.now.toISOString() });
    return { status: 204 };
  });

  /**
   * A fresh verification link for the signed-in account. Identity owns this
   * endpoint (verify-email-and-reset-password design); it is registered here
   * until that area's routes provide it, and theirs win (they register first).
   */
  r.post('/api/identity/email-verifications/resend', (ctx) => {
    if (!currentUser(ctx.store, ctx.cookies)) return unauthorized();
    return { status: 204 };
  });
}

// ---------- Endpoints --------------------------------------------------------

type Found = { user: User; e: Enquiry; party: Party };

/** The signed-in party and their enquiry, or the reply that ends the request: 401, or 404 for anyone else (L2-034.1). */
function load(ctx: Ctx<Store>): Found | Reply {
  const user = currentUser(ctx.store, ctx.cookies);
  if (!user) return unauthorized();
  const e = ctx.store.enquiries.find((x) => x.id === ctx.params['id']);
  const party = e ? partyOf(user, e) : null;
  if (!e || !party) return notFound();
  return { user, e, party };
}

const isReply = (x: Found | Reply): x is Reply => 'status' in x && typeof (x as Reply).status === 'number';

function markRead(store: Store, e: Enquiry, party: Party): void {
  e.readAt[party] = store.now.toISOString() > lastActivityAt(e) ? store.now.toISOString() : lastActivityAt(e);
}

function push(store: Store, e: Enquiry, ev: Omit<EnquiryEvent, 'id' | 'at'>): EnquiryEvent {
  // Keep events in time order even if the fake clock is behind the seed.
  const at = new Date(Math.max(store.now.getTime(), new Date(lastActivityAt(e)).getTime() + 60_000)).toISOString();
  const full: EnquiryEvent = { id: randomUUID(), at, ...ev };
  e.events.push(full);
  return full;
}

export function registerEnquiries(r: Router<Store>): void {
  registerSending(r);

  /** One page of the caller's inbox (browse-inbox design). */
  r.get('/api/enquiries', (ctx) => {
    const user = currentUser(ctx.store, ctx.cookies);
    if (!user) return unauthorized();
    if (user.role !== 'Customer' && user.role !== 'Caterer') return forbidden();
    const all = enquiriesOf(ctx.store, user);
    // Unknown values are ignored and out-of-range pages fall back to page 1 (browse-inbox design).
    const filter = FILTERS[ctx.query.get('status') as InboxFilter];
    const matching = filter ? all.filter((x) => x.e.status === filter) : all;
    const pageCount = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
    const requested = Number(ctx.query.get('page') ?? '1');
    const page = Number.isInteger(requested) && requested >= 1 && requested <= pageCount ? requested : 1;
    const count = (s: EnquiryStatus) => all.filter((x) => x.e.status === s).length;
    const view: InboxPageView = {
      items: matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(({ e, party }) => rowView(ctx.store, e, party)),
      total: matching.length,
      page,
      pageSize: PAGE_SIZE,
      pageCount,
      counts: { all: all.length, open: count('Open'), replied: count('Replied'), declined: count('Declined'), closed: count('Closed') },
      unread: all.filter(({ e, party }) => isUnread(e, party)).length,
    };
    return ok(view);
  });

  /** The thread; opening it marks it read unless `markRead=false` (the caterer's preview pane). */
  r.get('/api/enquiries/:id', (ctx) => {
    const found = load(ctx);
    if (isReply(found)) return found;
    const { e, party } = found;
    if (ctx.query.get('markRead') !== 'false') markRead(ctx.store, e, party);
    return ok(threadView(ctx.store, e, party));
  });

  /** A reply of 1 to 2,000 characters (L2-032.2); closed and declined threads take no more (L2-033.5). */
  r.post('/api/enquiries/:id/messages', (ctx) => {
    const found = load(ctx);
    if (isReply(found)) return found;
    const { e, party } = found;
    if (e.status === 'Closed' || e.status === 'Declined') return conflict('This enquiry is closed');
    if (party === 'caterer' && !liveCustomer(ctx.store, e)) return conflict('This person has left Sweet Hand');
    const text = clean(ctx.body?.text);
    if (!text.trim()) return invalid({ reply: ['Write a reply before sending'] });
    if (length(text) > REPLY_MAX) return invalid({ reply: [`Keep your reply under 2,000 characters`] });
    const ev = push(ctx.store, e, { kind: 'reply', by: party, text });
    if (party === 'caterer' && e.status === 'Open') e.status = 'Replied';
    markRead(ctx.store, e, party);
    const result: ReplyResult = {
      entry: { kind: 'reply', id: ev.id, from: party, text, at: ev.at },
      status: e.status,
      emailDelayed: delayedEmails.has(ctx.store),
    };
    return ok(result, 201);
  });

  /** Only the caterer, only while Open, with an optional note of up to 500 characters (L2-033.2, L2-033.3). */
  r.post('/api/enquiries/:id/decline', (ctx) => {
    const found = load(ctx);
    if (isReply(found)) return found;
    const { e, party } = found;
    if (party !== 'caterer') return forbidden();
    const note = clean(ctx.body?.note).trim();
    if (length(note) > NOTE_MAX) return invalid({ note: ['Keep your note under 500 characters'] });
    if (e.status !== 'Open') return conflict('Only an open enquiry can be declined', { status: e.status });
    e.status = 'Declined';
    push(ctx.store, e, { kind: 'declined', by: 'caterer', note: note || null });
    markRead(ctx.store, e, party);
    return ok(threadView(ctx.store, e, party));
  });

  /** Either party closes an Open or Replied enquiry (L2-033). */
  r.post('/api/enquiries/:id/close', (ctx) => {
    const found = load(ctx);
    if (isReply(found)) return found;
    const { e, party } = found;
    if (e.status !== 'Open' && e.status !== 'Replied') return conflict('This enquiry is already closed', { status: e.status });
    e.status = 'Closed';
    push(ctx.store, e, { kind: 'closed', by: party });
    markRead(ctx.store, e, party);
    return ok(threadView(ctx.store, e, party));
  });

  /** Reveals the caller's own contact details to the other party in this thread only (L2-035). */
  r.post('/api/enquiries/:id/contact-shares', (ctx) => {
    const found = load(ctx);
    if (isReply(found)) return found;
    const { e, party } = found;
    if (e.status !== 'Open' && e.status !== 'Replied') return conflict('This enquiry is closed', { status: e.status });
    if (!e.events.some((ev) => ev.kind === 'shared' && ev.by === party)) push(ctx.store, e, { kind: 'shared', by: party });
    markRead(ctx.store, e, party);
    return ok(threadView(ctx.store, e, party));
  });
}

// ---------- Scenarios --------------------------------------------------------

function userByEmail(store: Store, email: string): User {
  const u = store.users.find((x) => x.email === email);
  if (!u) throw new Error(`No user ${email}`);
  return u;
}

function find(store: Store, args: { customer?: string; caterer: string }): Enquiry {
  const c = store.caterers.find((x) => x.slug === args.caterer);
  const customer = args.customer && args.customer !== 'former' ? userByEmail(store, args.customer) : undefined;
  const e = store.enquiries.find((x) =>
    x.catererId === c?.id && (args.customer === 'former' ? !liveCustomer(store, x) : !customer || x.customerId === customer.id),
  );
  if (!e) throw new Error(`No enquiry for ${JSON.stringify(args)}`);
  return e;
}

const FIRST_NAMES = ['Kwame', 'Rhea', 'Leon', 'Tara', 'Grace', 'Omar', 'Chantal', 'Winston', 'Lisa', 'Patrick', 'Ayesha', 'Dwayne'];
const LAST_NAMES = ['Owusu', 'Mahabir', 'Bascombe', 'Singh', 'Alleyne', 'Hosein'];
/** Fictional, unique names for extra customers; the first one is long, to show truncation. */
const customerName = (i: number) =>
  i === 0 ? 'Simone Achterberg-Ramkissoon' : `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]}`;

/** Named store changes tests can ask for (`backend.scenario(name, args)`). */
export const enquiriesScenarios: Record<string, (store: Store, args: any) => unknown> = {
  /** The id of one enquiry, by customer email (or 'former') and caterer slug. */
  'enquiry-id': (store, args: { customer?: string; caterer: string }) => ({ id: find(store, args).id }),

  /** Make exactly `count` of a user's threads unread, newest first (L2-029). */
  'set-unread': (store, { email, count }: { email: string; count: number }) => {
    const user = userByEmail(store, email);
    let left = count;
    for (const { e, party } of enquiriesOf(store, user)) {
      const theirs = activityBy(e, other(party)).sort();
      if (left > 0 && theirs.length) {
        e.readAt[party] = new Date(new Date(theirs.at(-1)!).getTime() - 1000).toISOString();
        left -= 1;
      } else {
        e.readAt[party] = lastActivityAt(e);
      }
    }
  },

  /** The other party writes in a thread, as if from another device. */
  'add-message': (store, args: { customer?: string; caterer: string; from: Party; text: string }) => {
    const e = find(store, args);
    push(store, e, { kind: 'reply', by: args.from, text: args.text });
    if (args.from === 'caterer' && e.status === 'Open') e.status = 'Replied';
  },

  /** Moves an enquiry to a status as if it happened elsewhere (another tab, the other party, the daily job). */
  'set-status': (store, args: { customer?: string; caterer: string; status: EnquiryStatus }) => {
    const e = find(store, args);
    if (args.status === 'Closed') push(store, e, { kind: 'closed', by: 'customer' });
    if (args.status === 'Declined') push(store, e, { kind: 'declined', by: 'caterer', note: null });
    if (args.status === 'Replied') push(store, e, { kind: 'reply', by: 'caterer', text: 'Thanks for asking! Yes, we can do that.' });
    e.status = args.status;
  },

  /** One party shares their contact details in a thread, as if from another device. */
  'share-contact': (store, args: { customer?: string; caterer: string; by: Party }) => {
    push(store, find(store, args), { kind: 'shared', by: args.by });
  },

  /** A second enquiry between the same customer and caterer (L2-035.3). */
  'another-enquiry': (store, args: { customer: string; caterer: string }) => {
    const first = find(store, args);
    const e: Enquiry = {
      ...first,
      id: randomUUID(),
      eventDate: '2026-12-19',
      guests: 40,
      occasion: 'birthdays',
      message: 'Another one: could you do a small Christmas lunch for 40?',
      createdAt: new Date(store.now.getTime() - 3_600_000).toISOString(),
      status: 'Open',
      events: [],
      readAt: {},
    };
    store.enquiries.push(e);
    return { id: e.id };
  },

  'set-event-date': (store, args: { customer?: string; caterer: string; date: string }) => {
    find(store, args).eventDate = args.date;
  },

  /** The mail service is slow: replies still save, and say so (L2-030.1). */
  'emails-running-late': (store) => {
    delayedEmails.add(store);
  },

  /** The email provider is down: sending still works and the email waits in the queue (L2-030.1, L2-091.1). */
  'email-provider-down': (store) => {
    emailDown.add(store);
  },

  /** A customer who registered but has not verified their email yet (L2-023.2). */
  'unverified-customer': (store, { email }: { email: string }) => {
    userByEmail(store, email).emailVerified = false;
  },

  /** The customer follows the verification link (verify-email design). */
  'verify-email': (store, { email }: { email: string }) => {
    userByEmail(store, email).emailVerified = true;
  },

  /** The customer has sent 10 enquiries in the past 24 hours (L2-025.1). */
  'daily-enquiry-limit-reached': (store, { email }: { email: string }) => {
    const user = userByEmail(store, email);
    const others = store.caterers.filter((c) => c.status === 'Published' && c.id !== 'cat-001').slice(0, DAILY_LIMIT);
    others.forEach((c, i) => {
      const at = new Date(store.now.getTime() - (i + 1) * HOUR_MS).toISOString();
      store.enquiries.push({
        id: randomUUID(),
        customerId: user.id,
        catererId: c.id,
        eventDate: '2026-12-05',
        guests: 40,
        area: c.areas[0],
        fsa: null,
        occasion: 'birthdays',
        message: 'Could you cater a birthday lunch for 40 people?',
        createdAt: at,
        status: 'Open',
        events: [],
        readAt: { customer: at },
      });
    });
  },

  /** The customer's account was created 20 minutes ago (L2-025.3). */
  'new-account': (store, { email }: { email: string }) => {
    const user = userByEmail(store, email);
    user.createdAt = new Date(store.now.getTime() - 20 * 60_000).toISOString();
  },

  /** The user has never sent or received an enquiry. */
  'no-enquiries': (store, { email }: { email: string }) => {
    const user = userByEmail(store, email);
    store.enquiries = store.enquiries.filter((e) => !partyOf(user, e));
  },

  /** Older enquiries so the inbox runs to several pages (L2-031.1). */
  'more-enquiries': (store, { email, count, statuses }: { email: string; count: number; statuses: EnquiryStatus[] }) => {
    const user = userByEmail(store, email);
    const caterers = store.caterers.filter((c) => c.status === 'Published' && c.id !== 'cat-001');
    for (let i = 0; i < count; i++) {
      const created = new Date(Date.UTC(2026, 7, 30 - i, 18, 0));
      const status = statuses[i % statuses.length];
      let customerId = user.id;
      let catererId = caterers[i % caterers.length].id;
      if (user.role === 'Caterer') {
        catererId = user.catererId!;
        const name = customerName(i);
        customerId = `user-extra-${i}`;
        store.users.push({ ...user, id: customerId, role: 'Customer', displayName: name, email: `extra-${i}@example.com`, catererId: undefined, phone: undefined });
      }
      const events: EnquiryEvent[] = [];
      const at = (h: number) => new Date(created.getTime() + h * 3_600_000).toISOString();
      if (status !== 'Open') events.push({ id: randomUUID(), kind: status === 'Declined' ? 'declined' : 'reply', by: 'caterer', at: at(2), text: 'Thanks for asking. Here is what we can do.', note: null });
      if (status === 'Closed') events.push({ id: randomUUID(), kind: 'closed', by: 'customer', at: at(30) });
      store.enquiries.push({
        id: randomUUID(),
        customerId,
        catererId,
        eventDate: '2026-09-19',
        guests: 30 + i,
        area: 'scarborough',
        fsa: null,
        occasion: 'birthdays',
        message: 'Could you cater a birthday lunch?',
        createdAt: created.toISOString(),
        status,
        events,
        readAt: { customer: at(40), caterer: at(40) },
      });
    }
  },

  /** A week of back-and-forth with Pelau House (pages/thread/long). */
  'long-thread': (store, args: { customer?: string; caterer: string }) => {
    const e = find(store, args);
    const lines: [Party, string, string][] = [
      ['caterer', '2026-10-09T08:05:00-04:00', 'Hi Marcia, congratulations to your parents! Is the hall kitchen available for warming, or should we bring everything hot?'],
      ['customer', '2026-10-09T08:40:00-04:00', 'There’s a small kitchen with an oven, no stove.'],
      ['caterer', '2026-10-09T09:12:00-04:00', 'Perfect. We’ll bring chafing dishes and serving spoons. Any allergies in the group?'],
      ['customer', '2026-10-09T12:30:00-04:00', 'Two guests can’t have nuts, and my uncle doesn’t eat pork.'],
      ['caterer', '2026-10-09T13:02:00-04:00', 'No nuts or pork in any of those four dishes. I’ll leave the black cake off.'],
      ['customer', '2026-10-09T18:48:00-04:00', 'Could we add doubles as a starter?'],
      ['caterer', '2026-10-09T19:20:00-04:00', 'Yes, doubles are $3 each with a 40 minimum. For 120 that’s $360.'],
      ['customer', '2026-10-09T21:05:00-04:00', 'Let’s do it. What would the total be?'],
      ['caterer', '2026-10-10T09:42:00-04:00', 'For 120, the four dishes plus doubles come to about $2,960 before tax. Shall I hold the date?'],
      ['customer', '2026-10-10T09:50:00-04:00', 'Yes please! I’ll confirm the final count by 7 November.'],
    ];
    e.events = lines.map(([by, at, text]) => ({ id: randomUUID(), kind: 'reply', by, at: new Date(at).toISOString(), text }));
  },

  /** Markup and a link in messages, shown as plain text (pages/thread/edge, L2-032.3–4, L2-080.1). */
  'edge-thread': (store, args: { customer?: string; caterer: string }) => {
    const e = find(store, args);
    e.message = 'Could you do the menu from your photos? <script>alert(1)</script> Sorry, my phone pasted something odd.\n\nAlso: callaloo-macaroni-pie-curry-goat-pelau-doubles-aloo-pie-for-everyone-please!';
    e.events = [
      { id: randomUUID(), kind: 'reply', by: 'caterer', at: new Date('2026-10-10T09:42:00-04:00').toISOString(), text: 'Our full menu is at https://pelauhouse.example/menu-2026 — copy it into your browser. <img src=x onerror=alert(1)> was in your message too; it shows as plain text here.' },
      { id: randomUUID(), kind: 'reply', by: 'customer', at: new Date('2026-10-10T09:50:00-04:00').toISOString(), text: '👍🏾 Thank you! Ou se yon bon kizinyè. ¡Gracias!' },
    ];
  },
};

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
  EnquiryStatus,
  FitWarning,
  InboxFilter,
  InboxPageView,
  InboxRowView,
  OtherParty,
  Party,
  ReplyResult,
  ThreadEntryView,
  ThreadView,
} from '../../projects/web/src/app/core/api/enquiries.models.ts';

const PAGE_SIZE = 20;
const REPLY_MAX = 2000;
const NOTE_MAX = 500;
const FILTERS: Record<InboxFilter, EnquiryStatus> = { open: 'Open', replied: 'Replied', declined: 'Declined', closed: 'Closed' };

/** Extra state the enquiries area keeps per store, beside the seeded enquiries. */
const delayedEmails = new WeakSet<Store>();

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
    fitWarnings: viewer === 'caterer' ? fitWarnings(store, e) : [],
    entries: e.events.map((ev) => entryView(store, e, ev)),
    myContact: contactOf(store, e, viewer) ?? { name: '', email: '', phone: null },
    sharedByMe: e.events.some((ev) => ev.kind === 'shared' && ev.by === viewer),
    closesOn: active && e.eventDate < today ? addDays(e.eventDate, 30) : null,
  };
}

/** Plain text as given, minus control characters other than tab and newline (L2-080.4). */
const clean = (s: unknown) => (typeof s === 'string' ? s.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '') : '');
const length = (s: string) => [...s].length;

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

const CUSTOMER_NAMES = [
  'Simone Achterberg-Ramkissoon', 'Kwame Owusu', 'Rhea Mahabir', 'Leon Bascombe', 'Tara Singh', 'Grace Alleyne', 'Omar Hosein',
  'Chantal Dorval', 'Winston Greaves', 'Lisa Ramnarine', 'Patrick Nurse', 'Ayesha Mohammed', 'Dwayne Charles',
];

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

  'set-event-date': (store, args: { customer?: string; caterer: string; date: string }) => {
    find(store, args).eventDate = args.date;
  },

  /** The mail service is slow: replies still save, and say so (L2-030.1). */
  'emails-running-late': (store) => {
    delayedEmails.add(store);
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
        const name = CUSTOMER_NAMES[i % CUSTOMER_NAMES.length];
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

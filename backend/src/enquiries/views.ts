/** Wire views of enquiries for one viewer (browse-inbox and reply-in-thread designs). */
import type { Transaction } from '../platform/database.ts';
import type { ContactDetails } from '@contract/contact-details.ts';
import type { FitWarning } from '@contract/fit-warning.ts';
import type { InboxRowView } from '@contract/inbox-row-view.ts';
import type { OtherParty } from '@contract/other-party.ts';
import type { Party } from '@contract/party.ts';
import type { ThreadEntryView } from '@contract/thread-entry-view.ts';
import type { ThreadView } from '@contract/thread-view.ts';
import { caterers, type Caterer } from '../caterers/model.ts';
import { liveUser, users, type User } from '../identity/model.ts';
import { areaName, occasionName } from '../discovery/taxonomy.ts';
import { torontoDate } from '../discovery/listing.ts';
import type { Enquiry, EnquiryEvent } from './model.ts';
import { isActive, isUnread, lastActivityAt } from './rules.ts';

export function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words.length > 1 ? words.at(-1)![0] : '')).toUpperCase();
}

export const firstName = (name: string) => name.split(/\s+/)[0];

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const catererPhoto = (c: Caterer) => `/media/${c.photos[0]?.file ?? `${c.slug}.jpg`}?w=400&fm=jpeg`;

/** The records a view of one enquiry reads; the customer is `undefined` once their account is deleted (L2-072.2). */
export interface EnquiryParties {
  caterer: Caterer;
  customer: User | undefined;
}

export async function partiesOf(tx: Transaction, e: Enquiry): Promise<EnquiryParties> {
  const caterer = await caterers(tx).get(e.catererId);
  if (!caterer) throw new Error(`Enquiry ${e.id} names a missing caterer`);
  return { caterer, customer: await liveUser(tx, e.customerId) };
}

function otherParty({ caterer, customer }: EnquiryParties, viewer: Party): OtherParty {
  if (viewer === 'customer') return { kind: 'caterer', name: caterer.name, slug: caterer.slug, photo: catererPhoto(caterer) };
  return customer ? { kind: 'customer', name: customer.displayName, firstName: firstName(customer.displayName), initials: initials(customer.displayName) } : { kind: 'former' };
}

export function rowView(e: Enquiry, parties: EnquiryParties, viewer: Party): InboxRowView {
  return {
    id: e.id,
    otherParty: otherParty(parties, viewer),
    eventDate: e.eventDate,
    guests: e.guests,
    occasion: occasionName(e.occasion),
    status: e.status,
    lastActivityAt: lastActivityAt(e),
    unread: isUnread(e, viewer),
  };
}

/** The caterer's owner account, if it is still live. */
export async function catererOwner(tx: Transaction, caterer: Caterer): Promise<User | undefined> {
  const owners = caterer.ownerUserId ? [await users(tx).get(caterer.ownerUserId)] : await users(tx).find({ catererId: caterer.id });
  return owners.find((u) => u && !u.deleted);
}

/** A party's contact details, read from the account now so a deleted account shares nothing (L2-035, L2-072.2). */
async function contactOf(tx: Transaction, parties: EnquiryParties, party: Party): Promise<ContactDetails | null> {
  if (party === 'customer') {
    const u = parties.customer;
    return u ? { name: u.displayName, email: u.email, phone: u.phone ?? null } : null;
  }
  const c = parties.caterer;
  const owner = await catererOwner(tx, c);
  return { name: c.name, email: c.businessEmail ?? owner?.email ?? '', phone: c.businessPhone ?? owner?.phone ?? null };
}

/** Where the enquiry falls outside what the caterer says they take on (L2-024). */
export function fitWarnings(caterer: Caterer, e: Pick<Enquiry, 'guests' | 'area'>): FitWarning[] {
  const out: FitWarning[] = [];
  if (e.guests < caterer.minGuests || e.guests > caterer.maxGuests) out.push({ kind: 'guests', min: caterer.minGuests, max: caterer.maxGuests });
  if (!caterer.areas.includes(e.area)) out.push({ kind: 'area', area: areaName(e.area) });
  return out;
}

async function entryView(tx: Transaction, parties: EnquiryParties, ev: EnquiryEvent): Promise<ThreadEntryView> {
  switch (ev.kind) {
    case 'reply':
      return { kind: 'reply', id: ev.id, from: ev.by as Party, text: ev.text ?? '', at: ev.at };
    case 'declined':
      return { kind: 'declined', id: ev.id, note: ev.note ?? null, at: ev.at };
    case 'closed':
      return { kind: 'closed', id: ev.id, by: ev.by, at: ev.at };
    case 'shared':
      return { kind: 'shared', id: ev.id, by: ev.by as Party, at: ev.at, contact: await contactOf(tx, parties, ev.by as Party) };
  }
}

export async function threadView(tx: Transaction, e: Enquiry, viewer: Party, now: Date): Promise<ThreadView> {
  const parties = await partiesOf(tx, e);
  const { caterer, customer } = parties;
  const entries: ThreadEntryView[] = [];
  for (const ev of e.events) entries.push(await entryView(tx, parties, ev));
  return {
    id: e.id,
    viewer,
    status: e.status,
    caterer: { name: caterer.name, slug: caterer.slug, photo: catererPhoto(caterer) },
    customer: customer ? { name: customer.displayName, firstName: firstName(customer.displayName), initials: initials(customer.displayName) } : null,
    eventDate: e.eventDate,
    guests: e.guests,
    area: areaName(e.area),
    fsa: e.fsa,
    occasion: occasionName(e.occasion),
    message: e.message,
    sentAt: e.createdAt,
    fitWarnings: viewer === 'caterer' ? (e.fitWarnings ?? fitWarnings(caterer, e)) : [],
    entries,
    myContact: (await contactOf(tx, parties, viewer)) ?? { name: '', email: '', phone: null },
    sharedByMe: e.events.some((ev) => ev.kind === 'shared' && ev.by === viewer),
    // Open threads close automatically 30 days after the event (L2-033.4).
    closesOn: isActive(e) && e.eventDate < torontoDate(now) ? addDays(e.eventDate, 30) : null,
  };
}

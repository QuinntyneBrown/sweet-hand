/** Domain rules of an enquiry thread: parties, unread state, activity order (docs/detailed-designs/enquiries). */
import type { Transaction } from '../platform/database.ts';
import type { Party } from '@contract/party.ts';
import type { User } from '../identity/model.ts';
import { enquiries, type Enquiry, type EnquiryEvent } from './model.ts';

/** Which side of the enquiry the user is on; `null` when they are not a party (L2-034). */
export function partyOf(user: Pick<User, 'id' | 'role' | 'catererId'>, e: Enquiry): Party | null {
  if (user.role === 'Customer' && e.customerId === user.id) return 'customer';
  if (user.role === 'Caterer' && !!user.catererId && user.catererId === e.catererId) return 'caterer';
  return null;
}

export const otherSide = (p: Party): Party => (p === 'customer' ? 'caterer' : 'customer');

/** Times `party` did something the other side should see: creating it, a reply, a decline, a share (show-unread-indicators). */
export function activityBy(e: Enquiry, party: Party): string[] {
  const times = e.events.filter((ev) => ev.by === party && ev.kind !== 'closed').map((ev) => ev.at);
  if (party === 'customer') times.push(e.createdAt);
  return times;
}

export function isUnread(e: Enquiry, viewer: Party): boolean {
  const read = e.readAt[viewer];
  return activityBy(e, otherSide(viewer)).some((at) => !read || at > read);
}

export function lastActivityAt(e: Enquiry): string {
  return [e.createdAt, ...e.events.map((ev) => ev.at)].sort().at(-1)!;
}

export const isActive = (e: Enquiry) => e.status === 'Open' || e.status === 'Replied';

/** Enquiries a user is a party to, newest activity first (L2-031). */
export async function enquiriesOf(tx: Transaction, user: User): Promise<{ e: Enquiry; party: Party }[]> {
  let mine: Enquiry[] = [];
  if (user.role === 'Customer') mine = await enquiries(tx).find({ customerId: user.id });
  else if (user.role === 'Caterer' && user.catererId) mine = await enquiries(tx).find({ catererId: user.catererId });
  return mine
    .map((e) => ({ e, party: partyOf(user, e)! }))
    .filter((x) => x.party !== null)
    .sort((a, b) => lastActivityAt(b.e).localeCompare(lastActivityAt(a.e)) || a.e.id.localeCompare(b.e.id));
}

/** Threads with something unread, for the header badge (L2-029.1). */
export async function unreadThreads(tx: Transaction, user: User): Promise<number> {
  return (await enquiriesOf(tx, user)).filter(({ e, party }) => isUnread(e, party)).length;
}

/** Marks the thread read up to its latest activity for one party. */
export function markRead(e: Enquiry, party: Party, now: Date): void {
  const latest = lastActivityAt(e);
  const at = now.toISOString();
  e.readAt = { ...e.readAt, [party]: at > latest ? at : latest };
}

/**
 * Appends an event at `now`, kept after the thread's latest activity so the
 * thread stays in time order whatever the clock says.
 */
export function appendEvent(e: Enquiry, now: Date, id: string, ev: Omit<EnquiryEvent, 'id' | 'at'>): EnquiryEvent {
  const at = new Date(Math.max(now.getTime(), Date.parse(lastActivityAt(e)) + 1)).toISOString();
  const full: EnquiryEvent = { id, at, ...ev };
  e.events = [...e.events, full];
  return full;
}

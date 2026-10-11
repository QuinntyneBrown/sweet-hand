/**
 * Emails about enquiry activity (notify-enquiry-activity design). Each is
 * queued in the outbox in the same transaction as the change, so a failing
 * provider never loses it or fails the action (L2-030). They never carry the
 * customer's email address or phone number, and replies go to a no-reply
 * address so conversations stay in the thread (L2-027.3).
 */
import type { Transaction } from '../platform/database.ts';
import { outbox, queueEmail } from '../platform/outbox.ts';
import type { Party } from '@contract/party.ts';
import { areaName, occasionName } from '../discovery/taxonomy.ts';
import type { Enquiry } from './model.ts';
import { catererOwner, type EnquiryParties } from './views.ts';

export const NO_REPLY = 'no-reply@sweethand.ca';
/** Replies within this window of the first unsent one are reported in one email (L2-028.2). */
export const BATCH_WINDOW_MS = 10 * 60_000;
const EXCERPT = 200;

const excerpt = (text: string) => [...text].slice(0, EXCERPT).join('');
const threadLink = (e: Enquiry, recipient: Party) => (recipient === 'customer' ? `/inbox/${e.id}` : `/dashboard/enquiries/${e.id}`);
const common = { replyTo: NO_REPLY, transactional: true };

/** The address an email to a party goes to: the customer's account, or the caterer owner's account (L2-027). */
async function addressOf(tx: Transaction, parties: EnquiryParties, party: Party): Promise<string | undefined> {
  if (party === 'customer') return parties.customer?.email;
  return (await catererOwner(tx, parties.caterer))?.email;
}

/** New enquiry, to the caterer (L2-027.2). */
export async function notifyNewEnquiry(tx: Transaction, now: Date, e: Enquiry, parties: EnquiryParties): Promise<void> {
  const to = await addressOf(tx, parties, 'caterer');
  if (!to) return;
  await queueEmail(tx, now, {
    to,
    kind: 'new-enquiry',
    link: threadLink(e, 'caterer'),
    enquiryId: e.id,
    customerName: parties.customer?.displayName ?? '',
    eventDate: e.eventDate,
    guests: e.guests,
    area: areaName(e.area),
    occasion: occasionName(e.occasion),
    excerpt: excerpt(e.message),
    ...common,
  });
}

/**
 * A reply, to the other party (L2-028.1, L2-028.3). While an email about this
 * thread to the same person is still queued and within the batch window, the
 * reply is added to it instead of starting another (L2-028.2).
 */
export async function notifyReply(tx: Transaction, now: Date, e: Enquiry, parties: EnquiryParties, from: Party, text: string): Promise<void> {
  const recipient: Party = from === 'customer' ? 'caterer' : 'customer';
  const to = await addressOf(tx, parties, recipient);
  if (!to) return;
  const sender = from === 'caterer' ? parties.caterer.name : (parties.customer?.displayName ?? '');
  const pending = (await outbox(tx).find({ kind: 'enquiry-messages', enquiryId: e.id, to, status: 'queued' })).find(
    (m) => now.getTime() - Date.parse(m.at) < BATCH_WINDOW_MS,
  );
  if (pending) {
    await outbox(tx).put({ ...pending, messageCount: Number(pending['messageCount']) + 1, excerpt: excerpt(text) });
    return;
  }
  await queueEmail(tx, now, { to, kind: 'enquiry-messages', link: threadLink(e, recipient), enquiryId: e.id, from: sender, excerpt: excerpt(text), messageCount: 1, ...common });
}

/** A decline, to the customer, with any note (L2-028.4). */
export async function notifyDeclined(tx: Transaction, now: Date, e: Enquiry, parties: EnquiryParties, note: string | null): Promise<void> {
  const to = await addressOf(tx, parties, 'customer');
  if (!to) return;
  await queueEmail(tx, now, { to, kind: 'enquiry-declined', link: threadLink(e, 'customer'), enquiryId: e.id, from: parties.caterer.name, note, ...common });
}

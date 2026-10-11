import type { Transaction } from '../platform/database.ts';
import { torontoDate } from '../discovery/listing.ts';
import { enquiries } from '../enquiries/model.ts';
import { reviews, type Review } from './model.ts';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Authors may edit for 30 × 24 hours after first posting (L2-053). */
const EDIT_WINDOW_MS = 30 * DAY_MS;
/** A review may be written up to 90 days after the event (L2-049). */
const REVIEW_WINDOW_DAYS = 90;

export function editableUntil(r: Review): string {
  return new Date(Date.parse(r.createdAt) + EDIT_WINDOW_MS).toISOString();
}

/** The author may edit a published or held review within 30 days of first posting it (L2-053.1–2). */
export function canEdit(r: Review, now: Date): boolean {
  return (r.status === 'Published' || r.status === 'Held') && now.getTime() < Date.parse(editableUntil(r));
}

const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY_MS);

/**
 * The customer's most recent enquiry to the caterer that the caterer replied
 * to, whatever its status now, whose event is before today (Toronto) and no
 * more than 90 days ago (L2-049).
 */
export async function eligibleEvent(tx: Transaction, now: Date, customerId: string, catererId: string): Promise<{ eventDate: string } | undefined> {
  const today = torontoDate(now);
  return (await enquiries(tx).find({ customerId, catererId }))
    .filter((e) => e.eventDate < today && daysBetween(e.eventDate, today) <= REVIEW_WINDOW_DAYS)
    .filter((e) => e.events.some((ev) => ev.kind === 'reply' && ev.by === 'caterer'))
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate))[0];
}

/** The customer's one review of the caterer, unless an operator removed it (L2-049: one per caterer). */
export async function ownReview(tx: Transaction, authorUserId: string, catererId: string): Promise<Review | undefined> {
  return (await reviews(tx).find({ authorUserId, catererId })).find((r) => r.status !== 'Removed');
}

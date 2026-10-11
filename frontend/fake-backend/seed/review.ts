import type { ReviewStatus } from './reviews.ts';

export interface Review {
  id: string;
  catererId: string;
  /** The customer account that wrote it, when the reviewer can sign in. */
  authorUserId?: string;
  /** The reviewer's display name; shown as "Marcia T." (L2-051.3). */
  authorName: string;
  rating: number;
  text: string;
  /** Event date of the eligible enquiry, YYYY-MM-DD; shown as "Event in August 2026". */
  eventDate: string;
  createdAt: string;
  editedAt?: string;
  status: ReviewStatus;
  response?: { text: string; createdAt: string };
  /** Hidden reviews: who hid it (an operator's user id, or null when hidden automatically after reports), why and when (L2-059). */
  hidden?: { by: string | null; reports: number; reason: string; at: string };
  /** Why a held review was held back (L2-050.3). */
  holdReason?: 'phone' | 'email' | 'link';
  /** Who hid a hidden review: three reports in 7 days (L2-055.2) or an operator; and when. */
  hiddenBy?: 'reports' | 'operator';
  hiddenAt?: string;
}

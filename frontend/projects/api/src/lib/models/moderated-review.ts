import type { ModerationStatus } from './moderation-status';

/** A held or hidden review on the operator Reviews screen (moderate-reviews). */
export interface ModeratedReview {
  id: string;
  status: ModerationStatus;
  catererName: string;
  catererSlug: string;
  catererPhoto: string;
  /** "Priya R." */
  reviewer: string;
  rating: number;
  text: string;
  /** YYYY-MM-DD */
  eventDate: string;
  /** Held reviews: what the check matched, and where. */
  held?: { reason: 'phone' | 'link' | 'email'; ranges: { start: number; end: number }[] } | null;
  /** Hidden reviews: who hid it and why; `by` is null when hidden automatically after reports. */
  hidden?: { by: string | null; reports: number; reason: string } | null;
  /** When it was held or hidden, UTC. */
  at: string;
}

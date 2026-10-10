/** Wire types for reviews (ADR 0003, docs/detailed-designs/reviews). Shared with the fake backend; keep import-free. */

/** One published review as anyone may see it (L2-051.3): no email, account id or status (L2-014). */
export interface PublicReviewView {
  id: string;
  /** First name and last initial: "Marcia T.". */
  author: string;
  /** Month of the event, YYYY-MM, shown as "Event in August 2026". */
  eventMonth: string;
  rating: number;
  text: string;
  edited: boolean;
  /** The caterer's public response (L2-052). */
  response: { text: string } | null;
}

/** One page of a caterer's published reviews, newest first, 10 per page (L2-051.4). */
export interface ReviewPageView {
  items: PublicReviewView[];
  page: number;
  pageCount: number;
  total: number;
}

/**
 * What the signed-in customer may do about reviewing this caterer (L2-049, L2-053):
 * write one, edit or delete theirs, or nothing.
 */
export type ReviewEligibility =
  | {
      status: 'Eligible';
      /** The event date of the eligible enquiry, YYYY-MM-DD. */
      eventDate: string;
      /** How the review will be signed: "Jean-Robert P.". */
      reviewerLabel: string;
    }
  | {
      status: 'AlreadyReviewed';
      review: PublicReviewView;
      canEdit: boolean;
      canDelete: boolean;
      /** End of the 30-day edit window (ISO), while it is open. */
      editableUntil: string | null;
    }
  | { status: 'NotEligible' };

export interface ReviewRequest {
  rating: number;
  text: string;
}

/** Answer to posting or editing: published at once, or held for a quick check (L2-050.3). */
export interface ReviewResult {
  status: 'Published' | 'Held';
  editableUntil: string;
}

import type { PublicReviewView } from './public-review-view';

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

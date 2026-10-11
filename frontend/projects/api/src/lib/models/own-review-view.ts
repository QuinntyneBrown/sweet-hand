/** One review of the caterer's business, for responding (respond-to-review design). */
export interface OwnReviewView {
  id: string;
  /** "Andre C." */
  author: string;
  /** YYYY-MM. */
  eventMonth: string;
  postedAt: string;
  rating: number;
  text: string;
  response: { text: string; createdAt: string } | null;
}

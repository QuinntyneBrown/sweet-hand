/** Fictional reviews from docs/mocks/README.md ("Cast and catalog"). All people are fictional. */

export type ReviewStatus = 'Published' | 'Held' | 'Hidden' | 'Removed';

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
}

export function seedReviews(): Review[] {
  return [];
}

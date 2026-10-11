import type { PublicReviewView } from './public-review-view';

/** One page of a caterer's published reviews, newest first, 10 per page (L2-051.4). */
export interface ReviewPageView {
  items: PublicReviewView[];
  page: number;
  pageCount: number;
  total: number;
}

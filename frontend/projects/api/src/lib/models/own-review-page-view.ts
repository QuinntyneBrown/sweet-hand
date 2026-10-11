import type { OwnReviewView } from './own-review-view';

export interface OwnReviewPageView {
  items: OwnReviewView[];
  page: number;
  pageCount: number;
  total: number;
  /** Average of published reviews; 0 when there are none. */
  average: number;
  /** Reviews that have no response yet. */
  unanswered: number;
}

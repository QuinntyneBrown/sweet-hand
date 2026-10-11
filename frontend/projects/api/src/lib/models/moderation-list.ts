import type { ModeratedReview } from './moderated-review';

export interface ModerationList {
  held: number;
  hidden: number;
  reviews: ModeratedReview[];
}

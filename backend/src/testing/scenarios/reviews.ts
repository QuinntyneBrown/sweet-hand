import { caterers } from '../../caterers/model.ts';
import { reviews, type ReviewStatus } from '../../reviews/model.ts';
import type { Scenarios } from '../scenario.ts';

export const reviewsScenarios: Scenarios = {
  /** Hold, hide or remove a review by its author's name: { caterer: slug, author: 'Marcia Thompson', status }. */
  'set-review-status': async ({ tx }, { caterer, author, status }: { caterer: string; author: string; status: ReviewStatus }) => {
    const c = await caterers(tx).findOne({ slug: caterer });
    const review = c && (await reviews(tx).findOne({ catererId: c.id, authorName: author }));
    if (review) await reviews(tx).put({ ...review, status });
  },
};

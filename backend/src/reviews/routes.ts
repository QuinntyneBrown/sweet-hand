import { anonymous, type Area } from '../http/router.ts';
import { listPublicReviews } from './public-reviews.ts';

/** Reviews endpoints (docs/detailed-designs/reviews). */
export const reviewsArea: Area = (r) => {
  // Anonymous by explicit choice: published reviews are part of public browsing (L2-013).
  r.get('/api/public/caterers/:slug/reviews', anonymous, listPublicReviews);
};

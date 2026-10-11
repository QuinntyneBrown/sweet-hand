import { anonymous, roles, signedIn, type Area } from '../http/router.ts';
import { listPublicReviews } from './public-reviews.ts';
import { reviewEligibility } from './eligibility.ts';
import { writeReview } from './write.ts';
import { deleteReview, editReview } from './own-review.ts';

/** Reviews endpoints (docs/detailed-designs/reviews). */
export const reviewsArea: Area = (r) => {
  // Anonymous by explicit choice: published reviews are part of public browsing (L2-013).
  r.get('/api/public/caterers/:slug/reviews', anonymous, listPublicReviews);
  // Any signed-in caller may ask; only customers are ever eligible (L2-049.5).
  r.get('/api/me/caterers/:slug/review-eligibility', signedIn, reviewEligibility);
  // Caterers and operators never review (L2-049.5).
  r.post('/api/me/caterers/:slug/reviews', roles('Customer'), writeReview);
  r.put('/api/me/reviews/:id', roles('Customer'), editReview);
  r.delete('/api/me/reviews/:id', roles('Customer'), deleteReview);
};

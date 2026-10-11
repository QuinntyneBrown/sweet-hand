import type { Observable } from 'rxjs';
import type { ReviewEligibility, ReviewPageView, ReviewRequest, ReviewResult } from '../models/reviews.models';

/** Reviews of a caterer: reading, eligibility, writing, editing and deleting (ADR 0003). */
export abstract class ReviewsService {
  /** A page of published reviews; anonymous by explicit choice (L2-013). */
  abstract page(slug: string, page: number): Observable<ReviewPageView>;
  /** The signed-in customer's standing with this caterer (L2-049, L2-053). */
  abstract eligibility(slug: string): Observable<ReviewEligibility>;
  abstract create(slug: string, review: ReviewRequest): Observable<ReviewResult>;
  abstract update(reviewId: string, review: ReviewRequest): Observable<ReviewResult>;
  abstract remove(reviewId: string): Observable<void>;
}

import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { ReviewEligibility, ReviewPageView, ReviewRequest, ReviewResult } from '../models/reviews.models';

/** Reviews of a caterer: reading, eligibility, writing, editing and deleting (ADR 0003). */
export interface IReviewsService {
  /** A page of published reviews; anonymous by explicit choice (L2-013). */
  page(slug: string, page: number): Observable<ReviewPageView>;
  /** The signed-in customer's standing with this caterer (L2-049, L2-053). */
  eligibility(slug: string): Observable<ReviewEligibility>;
  create(slug: string, review: ReviewRequest): Observable<ReviewResult>;
  update(reviewId: string, review: ReviewRequest): Observable<ReviewResult>;
  remove(reviewId: string): Observable<void>;
}

export const REVIEWS_SERVICE = new InjectionToken<IReviewsService>('REVIEWS_SERVICE');

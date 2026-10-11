import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { ReviewEligibility, ReviewPageView, ReviewRequest, ReviewResult } from './reviews.models';

/** Reviews of a caterer: reading, eligibility, writing, editing and deleting (ADR 0003). */
export abstract class ReviewsApi {
  /** A page of published reviews; anonymous by explicit choice (L2-013). */
  abstract page(slug: string, page: number): Observable<ReviewPageView>;
  /** The signed-in customer's standing with this caterer (L2-049, L2-053). */
  abstract eligibility(slug: string): Observable<ReviewEligibility>;
  abstract create(slug: string, review: ReviewRequest): Observable<ReviewResult>;
  abstract update(reviewId: string, review: ReviewRequest): Observable<ReviewResult>;
  abstract remove(reviewId: string): Observable<void>;
}

@Injectable()
export class HttpReviewsApi extends ReviewsApi {
  private readonly http = inject(HttpClient);

  page(slug: string, page: number): Observable<ReviewPageView> {
    const params = page > 1 ? new HttpParams().set('page', page) : undefined;
    return this.http.get<ReviewPageView>(`/api/public/caterers/${encodeURIComponent(slug)}/reviews`, { params });
  }

  eligibility(slug: string): Observable<ReviewEligibility> {
    return this.http.get<ReviewEligibility>(`/api/me/caterers/${encodeURIComponent(slug)}/review-eligibility`);
  }

  create(slug: string, review: ReviewRequest): Observable<ReviewResult> {
    return this.http.post<ReviewResult>(`/api/me/caterers/${encodeURIComponent(slug)}/reviews`, review);
  }

  update(reviewId: string, review: ReviewRequest): Observable<ReviewResult> {
    return this.http.put<ReviewResult>(`/api/me/reviews/${encodeURIComponent(reviewId)}`, review);
  }

  remove(reviewId: string): Observable<void> {
    return this.http.delete<void>(`/api/me/reviews/${encodeURIComponent(reviewId)}`);
  }
}

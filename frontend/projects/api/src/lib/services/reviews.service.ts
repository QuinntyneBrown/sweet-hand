import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { ReviewEligibility, ReviewPageView, ReviewRequest, ReviewResult } from '../models/reviews.models';
import type { IReviewsService } from './reviews.service.contract';

@Injectable()
export class ReviewsService implements IReviewsService {
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

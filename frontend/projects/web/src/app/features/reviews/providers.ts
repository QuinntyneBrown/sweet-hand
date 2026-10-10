import type { Provider } from '@angular/core';
import { HttpReviewsApi, ReviewsApi } from '../../core/api/reviews-api';

/** API contracts of the reviews area (ADR 0003). */
export const reviewsProviders: Provider[] = [{ provide: ReviewsApi, useClass: HttpReviewsApi }];

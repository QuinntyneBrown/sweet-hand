import type { Provider } from '@angular/core';
import { HttpReportsApi, ReportsApi } from '../../core/api/reports-api';
import { HttpReviewsApi, ReviewsApi } from '../../core/api/reviews-api';

/**
 * API contracts of the reviews area (ADR 0003). Reports of caterers and reviews
 * are registered here too: the report dialog lives on the caterer page.
 */
export const reviewsProviders: Provider[] = [
  { provide: ReviewsApi, useClass: HttpReviewsApi },
  { provide: ReportsApi, useClass: HttpReportsApi },
];

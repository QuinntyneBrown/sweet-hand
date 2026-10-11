import type { Provider } from '@angular/core';
import { HttpReportsService, HttpReviewsService, ReportsService, ReviewsService } from '@sweet-hand/api';

/**
 * API contracts of the reviews area (ADR 0003). Reports of caterers and reviews
 * are registered here too: the report dialog lives on the caterer page.
 */
export const reviewsProviders: Provider[] = [
  { provide: ReviewsService, useClass: HttpReviewsService },
  { provide: ReportsService, useClass: HttpReportsService },
];

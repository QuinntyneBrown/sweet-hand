import type { Provider } from '@angular/core';
import { REPORTS_SERVICE, REVIEWS_SERVICE, ReportsService, ReviewsService } from '@sweet-hand/api';

/**
 * API contracts of the reviews area (ADR 0003). Reports of caterers and reviews
 * are registered here too: the report dialog lives on the caterer page.
 */
export const reviewsProviders: Provider[] = [
  { provide: REVIEWS_SERVICE, useClass: ReviewsService },
  { provide: REPORTS_SERVICE, useClass: ReportsService },
];

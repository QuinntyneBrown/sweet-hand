import type { Router } from '../lib/router.ts';
import type { Store } from '../lib/store.ts';
import type { RatingSummaryView } from '../../projects/web/src/app/core/api/caterer-page.models.ts';

/** Average and count of a caterer's published reviews; held, hidden and removed ones are left out (L2-051.5). */
export function ratingSummary(store: Store, catererId: string): RatingSummaryView {
  const published = store.reviews.filter((r) => r.catererId === catererId && r.status === 'Published');
  const total = published.reduce((sum, r) => sum + r.rating, 0);
  return { average: published.length ? total / published.length : 0, count: published.length };
}

/** Fake endpoints of the reviews area. */
export function registerReviews(r: Router<Store>): void {
  void r;
}

/** Named store changes tests can ask for (`backend.scenario(name, args)`). */
export const reviewsScenarios: Record<string, (store: Store, args: any) => unknown> = {};

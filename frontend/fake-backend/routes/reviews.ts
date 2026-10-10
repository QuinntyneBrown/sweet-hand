import type { Router } from '../lib/router.ts';
import type { Store } from '../lib/store.ts';

/** Fake endpoints of the reviews area. */
export function registerReviews(r: Router<Store>): void {
  void r;
}

/** Named store changes tests can ask for (`backend.scenario(name, args)`). */
export const reviewsScenarios: Record<string, (store: Store, args: any) => unknown> = {};

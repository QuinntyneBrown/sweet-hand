import type { Router } from '../lib/router.ts';
import type { Store } from '../lib/store.ts';

/** Fake endpoints of the reports area. */
export function registerReports(r: Router<Store>): void {
  void r;
}

/** Named store changes tests can ask for (`backend.scenario(name, args)`). */
export const reportsScenarios: Record<string, (store: Store, args: any) => unknown> = {};

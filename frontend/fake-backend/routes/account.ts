import type { Router } from '../lib/router.ts';
import type { Store } from '../lib/store.ts';

/** Fake endpoints of the account area. */
export function registerAccount(r: Router<Store>): void {
  void r;
}

/** Named store changes tests can ask for (`backend.scenario(name, args)`). */
export const accountScenarios: Record<string, (store: Store, args: any) => unknown> = {};

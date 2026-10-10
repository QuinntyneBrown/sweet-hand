import type { Router } from '../lib/router.ts';
import type { Store } from '../lib/store.ts';
import { registerDiscovery } from './discovery.ts';

/** Every feature area registers its routes here. */
export function registerRoutes(r: Router<Store>): void {
  registerDiscovery(r);
}

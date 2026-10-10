import type { Router } from '../lib/router.ts';
import type { Store } from '../lib/store.ts';
import { registerDiscovery } from './discovery.ts';
import { registerSession } from './session.ts';
import { registerIdentity } from './identity.ts';

/** Every feature area registers its routes here. */
export function registerRoutes(r: Router<Store>): void {
  registerSession(r);
  registerIdentity(r);
  registerDiscovery(r);
}

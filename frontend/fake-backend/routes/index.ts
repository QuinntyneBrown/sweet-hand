import type { Router } from '../lib/router.ts';
import type { Store } from '../lib/store.ts';
import { registerAccount } from './account.ts';
import { registerCatererProfile } from './caterer-profile.ts';
import { registerDiscovery } from './discovery.ts';
import { registerEnquiries } from './enquiries.ts';
import { registerIdentity } from './identity.ts';
import { registerOperator } from './operator.ts';
import { registerReports } from './reports.ts';
import { registerReviews } from './reviews.ts';
import { registerSession } from './session.ts';

/** Every feature area registers its routes here. */
export function registerRoutes(r: Router<Store>): void {
  registerSession(r);
  registerIdentity(r);
  registerDiscovery(r);
  registerAccount(r);
  registerEnquiries(r);
  registerReviews(r);
  registerReports(r);
  registerCatererProfile(r);
  registerOperator(r);
}

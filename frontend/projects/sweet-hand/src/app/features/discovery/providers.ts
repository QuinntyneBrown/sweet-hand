import type { Provider } from '@angular/core';
import { CATERER_PAGE_SERVICE, CatererPageService, DISCOVERY_SERVICE, DiscoveryService } from '@sweet-hand/api';

/** API contracts of the discovery area (ADR 0003). */
export const discoveryProviders: Provider[] = [
  { provide: DISCOVERY_SERVICE, useClass: DiscoveryService },
  { provide: CATERER_PAGE_SERVICE, useClass: CatererPageService },
];

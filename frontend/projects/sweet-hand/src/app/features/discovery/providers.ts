import type { Provider } from '@angular/core';
import { CatererPageService, DiscoveryService, HttpCatererPageService, HttpDiscoveryService } from '@sweet-hand/api';

/** API contracts of the discovery area (ADR 0003). */
export const discoveryProviders: Provider[] = [
  { provide: DiscoveryService, useClass: HttpDiscoveryService },
  { provide: CatererPageService, useClass: HttpCatererPageService },
];

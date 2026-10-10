import type { Provider } from '@angular/core';
import { DiscoveryApi, HttpDiscoveryApi } from '../../core/api/discovery-api';
import { CatererPageApi, HttpCatererPageApi } from '../../core/api/caterer-page-api';

/** API contracts of the discovery area (ADR 0003). */
export const discoveryProviders: Provider[] = [
  { provide: DiscoveryApi, useClass: HttpDiscoveryApi },
  { provide: CatererPageApi, useClass: HttpCatererPageApi },
];

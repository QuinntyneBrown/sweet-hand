import type { Provider } from '@angular/core';
import { CATERER_PROFILE_SERVICE, CatererProfileService } from '@sweet-hand/api';

/** API contracts of the dashboard area (ADR 0003): `{ provide: X_SERVICE, useClass: XService }`. */
export const dashboardProviders: Provider[] = [{ provide: CATERER_PROFILE_SERVICE, useClass: CatererProfileService }];

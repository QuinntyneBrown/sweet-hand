import type { Provider } from '@angular/core';
import { CatererProfileService, HttpCatererProfileService } from '@sweet-hand/api';

/** API contracts of the dashboard area (ADR 0003): `{ provide: XService, useClass: HttpXService }`. */
export const dashboardProviders: Provider[] = [{ provide: CatererProfileService, useClass: HttpCatererProfileService }];

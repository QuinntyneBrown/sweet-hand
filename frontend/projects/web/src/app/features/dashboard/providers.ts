import type { Provider } from '@angular/core';
import { CatererProfileApi, HttpCatererProfileApi } from '../../core/api/caterer-profile-api';

/** API contracts of the dashboard area (ADR 0003): `{ provide: XApi, useClass: HttpXApi }`. */
export const dashboardProviders: Provider[] = [{ provide: CatererProfileApi, useClass: HttpCatererProfileApi }];

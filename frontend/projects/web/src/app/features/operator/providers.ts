import type { Provider } from '@angular/core';
import { HttpOperatorSettingsApi, OperatorSettingsApi } from '../../core/api/operator-settings-api';

/** API contracts of the operator area (ADR 0003): `{ provide: XApi, useClass: HttpXApi }`. */
export const operatorProviders: Provider[] = [{ provide: OperatorSettingsApi, useClass: HttpOperatorSettingsApi }];

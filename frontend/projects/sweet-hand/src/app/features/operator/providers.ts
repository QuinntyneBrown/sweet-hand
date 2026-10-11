import type { Provider } from '@angular/core';
import { HttpMetricsService, HttpOperatorModerationService, HttpOperatorSettingsService, MetricsService, OperatorModerationService, OperatorSettingsService } from '@sweet-hand/api';

/** API contracts of the operator area (ADR 0003): `{ provide: XService, useClass: HttpXService }`. */
export const operatorProviders: Provider[] = [
  { provide: OperatorSettingsService, useClass: HttpOperatorSettingsService },
  { provide: MetricsService, useClass: HttpMetricsService },
  { provide: OperatorModerationService, useClass: HttpOperatorModerationService },
];

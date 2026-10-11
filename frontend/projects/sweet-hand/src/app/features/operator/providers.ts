import type { Provider } from '@angular/core';
import { METRICS_SERVICE, MetricsService, OPERATOR_MODERATION_SERVICE, OPERATOR_SETTINGS_SERVICE, OperatorModerationService, OperatorSettingsService } from '@sweet-hand/api';

/** API contracts of the operator area (ADR 0003): `{ provide: X_SERVICE, useClass: XService }`. */
export const operatorProviders: Provider[] = [
  { provide: OPERATOR_SETTINGS_SERVICE, useClass: OperatorSettingsService },
  { provide: METRICS_SERVICE, useClass: MetricsService },
  { provide: OPERATOR_MODERATION_SERVICE, useClass: OperatorModerationService },
];

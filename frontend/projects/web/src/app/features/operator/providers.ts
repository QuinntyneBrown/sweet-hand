import type { Provider } from '@angular/core';
import { HttpModerationApi, ModerationApi } from '../../core/api/operator-moderation-api';

/** API contracts of the operator area (ADR 0003): `{ provide: XApi, useClass: HttpXApi }`. */
export const operatorProviders: Provider[] = [{ provide: ModerationApi, useClass: HttpModerationApi }];

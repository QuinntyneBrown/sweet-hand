import type { Provider } from '@angular/core';
import { AccountApi, HttpAccountApi } from '../../core/api/account-api';

/** API contracts of the account area (ADR 0003). */
export const accountProviders: Provider[] = [{ provide: AccountApi, useClass: HttpAccountApi }];

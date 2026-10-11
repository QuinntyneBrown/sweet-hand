import type { Provider } from '@angular/core';
import { AccountApi, HttpAccountApi } from '../../core/api/account-api';
import { HttpNoticesApi, NoticesApi } from '../../core/api/notices-api';

/** API contracts of the account area (ADR 0003). */
export const accountProviders: Provider[] = [
  { provide: AccountApi, useClass: HttpAccountApi },
  { provide: NoticesApi, useClass: HttpNoticesApi },
];

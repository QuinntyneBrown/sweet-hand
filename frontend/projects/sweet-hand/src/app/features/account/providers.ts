import type { Provider } from '@angular/core';
import { AccountService, HttpAccountService, HttpNoticesService, NoticesService } from '@sweet-hand/api';

/** API contracts of the account area (ADR 0003). */
export const accountProviders: Provider[] = [
  { provide: AccountService, useClass: HttpAccountService },
  { provide: NoticesService, useClass: HttpNoticesService },
];

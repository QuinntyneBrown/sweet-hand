import type { Provider } from '@angular/core';
import { ACCOUNT_SERVICE, AccountService, NOTICES_SERVICE, NoticesService } from '@sweet-hand/api';

/** API contracts of the account area (ADR 0003). */
export const accountProviders: Provider[] = [
  { provide: ACCOUNT_SERVICE, useClass: AccountService },
  { provide: NOTICES_SERVICE, useClass: NoticesService },
];

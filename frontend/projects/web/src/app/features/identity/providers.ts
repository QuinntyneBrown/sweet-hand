import type { Provider } from '@angular/core';
import { HttpIdentityApi, IdentityApi } from '../../core/api/identity-api';

/** API contracts of the identity area (ADR 0003). */
export const identityProviders: Provider[] = [{ provide: IdentityApi, useClass: HttpIdentityApi }];

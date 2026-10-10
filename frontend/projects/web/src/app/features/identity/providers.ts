import type { Provider } from '@angular/core';
import { BotChallenge, LocalBotChallenge } from '../../core/api/bot-challenge';
import { HttpIdentityApi, IdentityApi } from '../../core/api/identity-api';
import { LocalSecurityKey, SecurityKey } from '../../core/api/security-key';

/** API contracts of the identity area (ADR 0003). */
export const identityProviders: Provider[] = [
  { provide: IdentityApi, useClass: HttpIdentityApi },
  { provide: BotChallenge, useClass: LocalBotChallenge },
  { provide: SecurityKey, useClass: LocalSecurityKey },
];

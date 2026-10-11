import type { Provider } from '@angular/core';
import { BotChallengeService, HttpIdentityService, HttpPrivacyService, IdentityService, LocalBotChallengeService, LocalSecurityKeyService, PrivacyService, SecurityKeyService } from '@sweet-hand/api';

/** API contracts of the identity area (ADR 0003). */
export const identityProviders: Provider[] = [
  { provide: IdentityService, useClass: HttpIdentityService },
  { provide: BotChallengeService, useClass: LocalBotChallengeService },
  { provide: SecurityKeyService, useClass: LocalSecurityKeyService },
  { provide: PrivacyService, useClass: HttpPrivacyService },
];

import type { Provider } from '@angular/core';
import { BOT_CHALLENGE_SERVICE, BotChallengeService, IDENTITY_SERVICE, IdentityService, PRIVACY_SERVICE, PrivacyService, SECURITY_KEY_SERVICE, SecurityKeyService } from '@sweet-hand/api';

/** API contracts of the identity area (ADR 0003). */
export const identityProviders: Provider[] = [
  { provide: IDENTITY_SERVICE, useClass: IdentityService },
  { provide: BOT_CHALLENGE_SERVICE, useClass: BotChallengeService },
  { provide: SECURITY_KEY_SERVICE, useClass: SecurityKeyService },
  { provide: PRIVACY_SERVICE, useClass: PrivacyService },
];

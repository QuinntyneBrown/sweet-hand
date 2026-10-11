import type { Type } from '@nestjs/common';
import type { PipelineOptions } from './http/nest/options.ts';
import { authenticate } from './identity/sessions.ts';
import { recordSecurityEvent } from './platform/security-log.ts';
import { HealthController } from './health/health.controller.ts';
import { DiscoveryController } from './discovery/discovery.controller.ts';
import { ModerationController } from './moderation/moderation.controller.ts';
import { CatererProfileController } from './caterer-profile/caterer-profile.controller.ts';
import { OperatorSettingsController } from './operator-settings/operator-settings.controller.ts';
import { AccountController } from './account/account.controller.ts';
import { ReportsController } from './reports/reports.controller.ts';
import { ReviewsController } from './reviews/reviews.controller.ts';
import { EnquiriesController } from './enquiries/enquiries.controller.ts';
import { IdentityController } from './identity/identity.controller.ts';

/** The product's request hooks: who is calling, and what a refusal records. */
export function productHooks(): Pick<PipelineOptions, 'authenticate' | 'onDenied'> {
  return {
    authenticate,
    // Authorisation failures are security events (L2-079.4); a missing session is not.
    onDenied: async (req, status) => {
      if (status === 403) await recordSecurityEvent(req, 'authorization-failure', { targetId: Object.values(req.params)[0] });
    },
  };
}

/** Every feature area's NestJS controller (ADR 0009). */
export const productControllers: Type<unknown>[] = [HealthController, DiscoveryController, IdentityController, EnquiriesController, ReviewsController, ReportsController, AccountController, OperatorSettingsController, CatererProfileController, ModerationController];

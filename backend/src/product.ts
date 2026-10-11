import type { Type } from '@nestjs/common';
import type { AppOptions } from './app.ts';
import { productAreas } from './areas.ts';
import { authenticate } from './identity/sessions.ts';
import { recordSecurityEvent } from './platform/security-log.ts';
import { HealthController } from './health/health.controller.ts';
import { DiscoveryController } from './discovery/discovery.controller.ts';
import { OperatorSettingsController } from './operator-settings/operator-settings.controller.ts';
import { AccountController } from './account/account.controller.ts';
import { ReportsController } from './reports/reports.controller.ts';
import { ReviewsController } from './reviews/reviews.controller.ts';
import { EnquiriesController } from './enquiries/enquiries.controller.ts';
import { IdentityController } from './identity/identity.controller.ts';

/** The product's routes and request hooks, shared by main.ts and the acceptance tests. */
export function productOptions(): Pick<AppOptions, 'areas' | 'authenticate' | 'onDenied'> {
  return {
    areas: productAreas,
    authenticate,
    // Authorisation failures are security events (L2-079.4); a missing session is not.
    onDenied: async (req, status) => {
      if (status === 403) await recordSecurityEvent(req, 'authorization-failure', { targetId: Object.values(req.params)[0] });
    },
  };
}

/** The NestJS controllers of every area moved to NestJS so far (ADR 0009). */
export const productControllers: Type<unknown>[] = [HealthController, DiscoveryController, IdentityController, EnquiriesController, ReviewsController, ReportsController, AccountController, OperatorSettingsController];

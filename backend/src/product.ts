import type { Type } from '@nestjs/common';
import type { PipelineOptions } from './http/nest/options.ts';
import { authenticate } from './identity/sessions.ts';
import { recordSecurityEvent } from './platform/security-log.ts';
import { raiseAlert } from './platform/alerts.ts';
import { recordEvent, recentEvents } from './platform/throttle.ts';
import type { Request } from './http/endpoint.ts';
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
    onDenied: async (req, status, targetId) => {
      if (status !== 403 && status !== 404) return;
      await recordSecurityEvent(req, 'authorization-failure', { targetId: targetId ?? Object.values(req.params)[0] });
      await watchAuthorisationFailures(req);
    },
  };
}

const FAILURE_WINDOW_MS = 5 * 60_000;
const FAILURES_BEFORE_ALERT = 10;

/** One alert when a session reaches 10 authorisation failures within 5 minutes (L2-084.3). */
async function watchAuthorisationFailures(req: Request): Promise<void> {
  const session = req.actor?.sessionId;
  if (!session) return;
  await recordEvent(req.tx, 'authorization-failure', session, req.now, FAILURE_WINDOW_MS);
  const recent = await recentEvents(req.tx, 'authorization-failure', session, req.now, FAILURE_WINDOW_MS);
  if (recent.length === FAILURES_BEFORE_ALERT) {
    await raiseAlert(req.tx, req.now, {
      kind: 'authorization-failures',
      message: `${FAILURES_BEFORE_ALERT} authorisation failures from one session within 5 minutes`,
      userId: req.actor!.userId,
    });
  }
}

/** Every feature area's NestJS controller (ADR 0010). */
export const productControllers: Type<unknown>[] = [HealthController, DiscoveryController, IdentityController, EnquiriesController, ReviewsController, ReportsController, AccountController, OperatorSettingsController, CatererProfileController, ModerationController];

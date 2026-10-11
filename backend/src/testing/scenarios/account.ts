import { findUserByEmail, users } from '../../identity/model.ts';
import { notices } from '../../discovery/notices.ts';
import type { ScenarioContext, Scenarios } from '../scenario.ts';

async function user(ctx: ScenarioContext, email: string) {
  const found = await findUserByEmail(ctx.tx, email);
  if (!found) throw new Error(`No account for ${email}`);
  return found;
}

export const accountScenarios: Scenarios = {
  /** The account is waiting for its email to be verified; the link went out at `sentAt` (L2-023.2). */
  'unverify-email': async (ctx, { email, sentAt }: { email: string; sentAt?: string }) => {
    const u = await user(ctx, email);
    await users(ctx.tx).put({ ...u, emailVerified: false, verificationSentAt: sentAt ?? ctx.now.toISOString() });
  },
  /** The person opened their verification link somewhere else. */
  'verify-email-now': async (ctx, { email }: { email: string }) => {
    const u = await findUserByEmail(ctx.tx, email);
    if (u) await users(ctx.tx).put({ ...u, emailVerified: true });
  },
  /** Mail to the address bounced permanently (L2-030.3). */
  'bounce-email': async (ctx, { email }: { email: string }) => {
    const u = await user(ctx, email);
    await users(ctx.tx).put({ ...u, emailBounced: true });
  },
  /** Planned maintenance in a window (L2-088). */
  'schedule-maintenance': async ({ tx }, { startsAt, endsAt }: { startsAt: string; endsAt: string }) => {
    await notices(tx).put({ id: `maintenance-${startsAt}`, kind: 'maintenance', startsAt, endsAt });
  },
  /** A dependency is struggling (L2-091). */
  'degrade-service': async ({ tx }) => {
    await notices(tx).put({ id: 'degraded', kind: 'degraded' });
  },
};

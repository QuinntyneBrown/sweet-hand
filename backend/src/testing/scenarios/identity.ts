import { queueEmail } from '../../platform/outbox.ts';
import { setEvents } from '../../platform/throttle.ts';
import { findUserByEmail, users } from '../../identity/model.ts';
import { publishPrivacyNotice } from '../../identity/privacy.ts';
import { issueToken, sendVerification } from '../../identity/tokens.ts';
import { savedEnquiries } from '../../identity/verification.ts';
import { FAILURE_WINDOW_MS, NETWORK_FAILURE_KIND, NETWORK_FAILURES } from '../../identity/sign-in.ts';
import { LOCAL_ADDRESSES, type ScenarioContext, type Scenarios } from '../scenario.ts';

async function user(ctx: ScenarioContext, email: string) {
  const found = await findUserByEmail(ctx.tx, email);
  if (!found) throw new Error(`No account for ${email}`);
  return found;
}

export const identityScenarios: Scenarios = {
  /** A notice with substantially different purposes takes effect 1 November 2026 (L2-070.4). */
  'publish-privacy-notice': async ({ tx }) => {
    await publishPrivacyNotice(tx, {
      version: '2026-11',
      effectiveDate: '2026-11-01',
      substantialChange: true,
      changes: [
        'We now use a Canadian email provider in Montréal, Quebec, to send notifications.',
        'Visit counts use a daily hash that can’t be linked across days.',
        'Closed enquiries are deleted 3 years after they close.',
      ],
    });
  },
  /** The account is waiting for verification and a link was emailed just now; returns its path. */
  'issue-verification': async (ctx, { email }: { email: string }) => {
    const u = await user(ctx, email);
    const unverified = { ...u, emailVerified: false };
    await users(ctx.tx).put(unverified);
    return { link: await sendVerification(ctx, unverified) };
  },
  /** The customer filled in an enquiry before verifying (L2-023.3). */
  'save-enquiry-draft': async (ctx, { email, catererSlug, eventDate, guests }: { email: string; catererSlug: string; eventDate: string; guests: number }) => {
    const u = await findUserByEmail(ctx.tx, email);
    if (u) await savedEnquiries(ctx.tx).put({ id: u.id, catererSlug, eventDate, guests });
  },
  /** A reset link was emailed just now; returns its path. */
  'issue-password-reset': async (ctx, { email }: { email: string }) => {
    const u = await user(ctx, email);
    const link = `/reset-password/${await issueToken(ctx.tx, ctx.now, u, 'reset')}`;
    await queueEmail(ctx.tx, ctx.now, { to: u.email, kind: 'password-reset', link });
    return { link };
  },
  /** 20 failed sign-ins from the browser's network in the last 15 minutes (L2-076.5). */
  'many-failed-sign-ins-from-network': async ({ tx, now }) => {
    const times = Array.from({ length: NETWORK_FAILURES }, () => now.toISOString());
    for (const ip of LOCAL_ADDRESSES) await setEvents(tx, NETWORK_FAILURE_KIND, ip, times);
  },
  /** The account has had 5 failed sign-ins: sign-in is paused for 15 minutes (L2-076.4). */
  'pause-sign-in': async (ctx, { email }: { email: string }) => {
    const u = await findUserByEmail(ctx.tx, email);
    if (u) await users(ctx.tx).put({ ...u, lockedUntil: new Date(ctx.now.getTime() + FAILURE_WINDOW_MS).toISOString() });
  },
};

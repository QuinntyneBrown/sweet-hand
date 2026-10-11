import type { Request, Reply } from '../http/router.ts';
import { ok, problem } from '../http/problems.ts';
import { validChallenge } from '../platform/bot-challenge.ts';
import { queueEmail } from '../platform/outbox.ts';
import { verifyAgainstNothing, verifyPassword } from '../platform/secrets.ts';
import { recentEvents, recordEvent } from '../platform/throttle.ts';
import { findUserByEmail, users, type User } from './model.ts';
import { clearSessionCookie, endCurrentSession, startSession } from './sessions.ts';
import { privacyUpdateRequired } from './privacy.ts';
import type { SignInLocked, SignInRequest, SignInResult } from '@contract/identity.models.ts';

const MINUTE = 60_000;
/** 5 failed sign-ins for one account within 15 minutes pause it for 15 minutes (L2-076.4). */
const ACCOUNT_FAILURES = 5;
export const FAILURE_WINDOW_MS = 15 * MINUTE;
/** 20 failed sign-ins from one network within 15 minutes need a bot-protection check (L2-076.5). */
export const NETWORK_FAILURES = 20;
export const NETWORK_FAILURE_KIND = 'sign-in-failure';

async function recordFailure(req: Request, user: User | undefined): Promise<void> {
  await recordEvent(req.tx, NETWORK_FAILURE_KIND, req.ip, req.now, FAILURE_WINDOW_MS);
  if (!user) return;
  const now = req.now.getTime();
  const recent = [...(user.failedSignInsAt ?? []), req.now.toISOString()].filter((t) => now - Date.parse(t) < FAILURE_WINDOW_MS);
  if (recent.length >= ACCOUNT_FAILURES) {
    await users(req.tx).put({ ...user, failedSignInsAt: [], lockedUntil: new Date(now + FAILURE_WINDOW_MS).toISOString() });
    await queueEmail(req.tx, req.now, { to: user.email, kind: 'sign-in-paused' });
  } else {
    await users(req.tx).put({ ...user, failedSignInsAt: recent });
  }
}

/**
 * Email and password sign-in (sign-in design). Operators get a session that
 * waits for the second step (L2-056.2).
 */
export async function signIn(req: Request): Promise<Reply> {
  const body = (req.body ?? {}) as Partial<SignInRequest>;
  // Past the network threshold nothing is checked until the challenge passes (L2-076.5, L2-082.2).
  const networkFailures = await recentEvents(req.tx, NETWORK_FAILURE_KIND, req.ip, req.now, FAILURE_WINDOW_MS);
  if (networkFailures.length >= NETWORK_FAILURES && !validChallenge(body.challengeToken, 'sign-in')) {
    return problem(400, 'Confirm you’re a person', { challengeRequired: true });
  }

  const password = typeof body.password === 'string' ? body.password : '';
  const user = await findUserByEmail(req.tx, body.email);
  if (user?.lockedUntil && Date.parse(user.lockedUntil) > req.now.getTime()) {
    return { status: 423, body: { title: 'Sign-in is paused for this account', lockedUntil: user.lockedUntil } satisfies SignInLocked };
  }
  // One message, status and timing for an unknown email and a wrong password (L2-076.3).
  const passed = user ? await verifyPassword(user.passwordHash, password) : await verifyAgainstNothing(password);
  if (!user || !passed) {
    await recordFailure(req, user);
    return problem(401, 'Email or password is incorrect');
  }

  await users(req.tx).put({ ...user, failedSignInsAt: [], lockedUntil: null });
  if (user.role === 'Operator') {
    await startSession(req, user, { pendingSecondFactor: true });
    return ok({ secondFactorRequired: true, privacyUpdateRequired: false } satisfies SignInResult);
  }
  await startSession(req, user);
  return ok({ secondFactorRequired: false, privacyUpdateRequired: await privacyUpdateRequired(req.tx, user) } satisfies SignInResult);
}

/** Ends the session on the server (L2-078.4). */
export async function signOut(req: Request): Promise<Reply> {
  await endCurrentSession(req);
  clearSessionCookie(req);
  return { status: 204 };
}

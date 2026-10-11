import type { Request, Reply } from '../http/router.ts';
import { ok, problem } from '../http/problems.ts';
import { verifyAgainstNothing, verifyPassword } from '../platform/secrets.ts';
import { findUserByEmail, users } from './model.ts';
import { clearSessionCookie, endCurrentSession, startSession } from './sessions.ts';
import { privacyUpdateRequired } from './privacy.ts';
import type { SignInRequest, SignInResult } from '@contract/identity.models.ts';

/**
 * Email and password sign-in (sign-in design). Operators get a session that
 * waits for the second step (L2-056.2).
 */
export async function signIn(req: Request): Promise<Reply> {
  const body = (req.body ?? {}) as Partial<SignInRequest>;
  const password = typeof body.password === 'string' ? body.password : '';
  const user = await findUserByEmail(req.tx, body.email);
  // One message, status and timing for an unknown email and a wrong password (L2-076.3).
  const passed = user ? await verifyPassword(user.passwordHash, password) : await verifyAgainstNothing(password);
  if (!user || !passed) return problem(401, 'Email or password is incorrect');

  await users(req.tx).put({ ...user, failedSignInsAt: [] });
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

import type { Request, Reply } from '../http/router.ts';
import { invalid, ok, unauthorized } from '../http/problems.ts';
import { validSecurityKeyAssertion } from '../platform/security-key.ts';
import type { SecondFactorRequest, SignInResult } from '@contract/identity.models.ts';
import { sessions, type User } from './model.ts';
import { currentSession } from './sessions.ts';
import { privacyUpdateRequired } from './privacy.ts';
import { verifyTotp } from './totp.ts';

/** An authenticator code or a security key completes an operator's sign-in (L2-056.2). */
export async function completeSecondFactor(req: Request): Promise<Reply> {
  const user = req.locals['pendingSecondFactor'] as User | undefined;
  const session = await currentSession(req);
  if (!user || !session?.pendingSecondFactor) return unauthorized();
  const body = (req.body ?? {}) as Partial<SecondFactorRequest> & { code?: unknown; assertion?: unknown };
  const passed =
    body.method === 'security key'
      ? user.secondFactor === 'security key' && validSecurityKeyAssertion(body.assertion)
      : body.method === 'authenticator app' && !!user.totpSecret && verifyTotp(user.totpSecret, body.code, req.now);
  if (!passed) return invalid({ code: ['That code didn’t work'] });
  await sessions(req.tx).put({ ...session, pendingSecondFactor: false, lastActiveAt: req.now.toISOString() });
  return ok({ secondFactorRequired: false, privacyUpdateRequired: await privacyUpdateRequired(req.tx, user) } satisfies SignInResult);
}

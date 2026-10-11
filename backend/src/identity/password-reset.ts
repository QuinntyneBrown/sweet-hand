import type { Request, Reply } from '../http/router.ts';
import { accepted, gone, invalid, ok, problem } from '../http/problems.ts';
import { validChallenge } from '../platform/bot-challenge.ts';
import { queueEmail } from '../platform/outbox.ts';
import { hashPassword } from '../platform/secrets.ts';
import { recentEvents, recordEvent } from '../platform/throttle.ts';
import type { PasswordResetLink, PasswordResetRequest, ResetPasswordRequest } from '@contract/identity.models.ts';
import { findUserByEmail, liveUser, users } from './model.ts';
import { passwordProblem } from './passwords.ts';
import { EMAIL, text } from './registration.ts';
import { clearSessionCookie, endSessionsOf } from './sessions.ts';
import { consumeToken, issueToken, liveToken } from './tokens.ts';

const HOUR = 60 * 60_000;
/** More than 5 password resets from one network in an hour get 429 (L2-082.3). */
const RESETS_PER_HOUR = 5;
export const RESET_REQUEST_KIND = 'password-reset-request';

const expired = () => gone('This link has expired');

/** The same 202 whether or not the email has an account (L2-077.1). */
export async function requestPasswordReset(req: Request): Promise<Reply> {
  const recent = await recentEvents(req.tx, RESET_REQUEST_KIND, req.ip, req.now, HOUR);
  if (recent.length >= RESETS_PER_HOUR) {
    const retryAfter = Math.ceil((Date.parse(recent[0]) + HOUR - req.now.getTime()) / 1000);
    return { ...problem(429, 'Too many reset requests'), headers: { 'retry-after': String(retryAfter) } };
  }
  const body = (req.body ?? {}) as Partial<PasswordResetRequest>;
  if (!validChallenge(body.challengeToken, 'password-reset')) return invalid({ challengeToken: ['Confirm you’re a person'] });
  if (!EMAIL.test(text(body.email))) return invalid({ email: ['Enter an email address like name@example.com'] });
  await recordEvent(req.tx, RESET_REQUEST_KIND, req.ip, req.now, HOUR);
  const user = await findUserByEmail(req.tx, body.email);
  if (user) await queueEmail(req.tx, req.now, { to: user.email, kind: 'password-reset', link: `/reset-password/${await issueToken(req.tx, req.now, user, 'reset')}` });
  return accepted();
}

export async function openResetLink(req: Request): Promise<Reply> {
  const token = await liveToken(req.tx, req.now, 'reset', req.params['token']);
  const user = await liveUser(req.tx, token?.userId);
  if (!user) return expired();
  return ok({ email: user.email } satisfies PasswordResetLink);
}

/** A new password ends every session of the account and is confirmed by email (L2-077.4). */
export async function resetPassword(req: Request): Promise<Reply> {
  const body = (req.body ?? {}) as Partial<ResetPasswordRequest>;
  const token = await liveToken(req.tx, req.now, 'reset', body.token);
  const user = await liveUser(req.tx, token?.userId);
  if (!token || !user) return expired();
  const weak = passwordProblem(body.password);
  if (weak) return invalid({ password: [weak] });
  await users(req.tx).put({ ...user, passwordHash: await hashPassword(String(body.password)), passwordChangedAt: req.now.toISOString(), lockedUntil: null, failedSignInsAt: [] });
  await consumeToken(req.tx, req.now, token);
  await endSessionsOf(req, user.id);
  await queueEmail(req.tx, req.now, { to: user.email, kind: 'password-changed' });
  clearSessionCookie(req);
  return { status: 204 };
}

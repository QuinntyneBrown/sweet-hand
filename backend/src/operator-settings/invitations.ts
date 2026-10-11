import { randomBytes, randomUUID } from 'node:crypto';
import type { Request, Reply } from '../http/endpoint.ts';
import { invalid, noContent, ok, problem } from '../http/problems.ts';
import { hashPassword, sha256 } from '../platform/secrets.ts';
import { validSecurityKeyAssertion } from '../platform/security-key.ts';
import { findUserByEmail, users, type SecondFactorMethod, type User } from '../identity/model.ts';
import { passwordProblem } from '../identity/passwords.ts';
import { verifyTotp } from '../identity/totp.ts';
import { currentPrivacyNotice, recordConsent } from '../identity/privacy.ts';
import { recordSecurityEvent } from '../platform/security-log.ts';
import { operatorInvitations, type OperatorInvitation } from './model.ts';

/**
 * Accepting an operator invitation (manage-operator-accounts design,
 * MfaEnrolmentScreen): the single-use link lets the new operator set a
 * password and enrol a second factor, which creates their account. The link
 * is anonymous by explicit choice: the token is the credential (L2-056.2,
 * L2-077.5). These shapes are not in the shared wire models yet.
 */

/** The invitation the link names, while it is unused, live and not withdrawn. */
async function liveInvitation(req: Request): Promise<OperatorInvitation | undefined> {
  const token = req.params['token'] ?? '';
  const invite = (await operatorInvitations(req.tx).find({ tokenHash: sha256(token) }))[0];
  if (!invite || invite.acceptedAt || invite.deactivatedAt || Date.parse(invite.expiresAt) <= req.now.getTime()) return undefined;
  return invite;
}

const expired = () => problem(404, 'This invitation link has expired or was already used');

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const newTotpSecret = () => [...randomBytes(32)].map((b) => BASE32[b & 31]).join('');

/** GET /api/operator-invitations/:token */
export async function viewInvitation(req: Request): Promise<Reply> {
  const invite = await liveInvitation(req);
  if (!invite) return expired();
  return ok({ name: invite.name, email: invite.email, admin: invite.admin });
}

/** POST /api/operator-invitations/:token/totp — a new secret for the authenticator app; only its latest one counts. */
export async function startTotpEnrolment(req: Request): Promise<Reply> {
  const invite = await liveInvitation(req);
  if (!invite) return expired();
  const secret = newTotpSecret();
  await operatorInvitations(req.tx).put({ ...invite, pendingTotpSecret: secret });
  const label = `${encodeURIComponent('Sweet Hand')}:${encodeURIComponent(invite.email)}`;
  return ok({ secret, uri: `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent('Sweet Hand')}` });
}

/** POST /api/operator-invitations/:token — sets the password and the second factor, and uses the link up. */
export async function acceptInvitation(req: Request): Promise<Reply> {
  const invite = await liveInvitation(req);
  if (!invite) return expired();
  const body = (req.body ?? {}) as { password?: unknown; method?: unknown; code?: unknown; assertion?: unknown };
  const errors: Record<string, string[]> = {};
  const weak = passwordProblem(body.password);
  if (weak) errors['password'] = [weak];
  let method: SecondFactorMethod | undefined;
  if (body.method === 'authenticator app') {
    if (invite.pendingTotpSecret && verifyTotp(invite.pendingTotpSecret, body.code, req.now)) method = 'authenticator app';
    else errors['code'] = ['That code didn’t work'];
  } else if (body.method === 'security key') {
    if (validSecurityKeyAssertion(body.assertion)) method = 'security key';
    else errors['code'] = ['Your security key wasn’t recognised'];
  } else errors['method'] = ['Choose how you’ll confirm it’s you'];
  if (Object.keys(errors).length || !method) return invalid(errors);
  if (await findUserByEmail(req.tx, invite.email)) return expired();

  const now = req.now.toISOString();
  const notice = await currentPrivacyNotice(req.tx);
  const user: User = {
    id: `user-${randomUUID()}`,
    role: 'Operator',
    admin: invite.admin,
    displayName: invite.name,
    email: invite.email,
    emailKey: invite.emailKey,
    passwordHash: await hashPassword(String(body.password)),
    passwordChangedAt: now,
    // The invitation link proved the address.
    emailVerified: true,
    createdAt: now,
    secondFactor: method,
    ...(method === 'authenticator app' ? { totpSecret: invite.pendingTotpSecret } : {}),
    acceptedPrivacyVersion: notice.version,
    acceptedPrivacyAt: now,
  };
  await users(req.tx).put(user);
  await recordConsent(req.tx, user.id, notice.version, req.now);
  const { pendingTotpSecret: _secret, ...rest } = invite;
  void _secret;
  await operatorInvitations(req.tx).put({ ...rest, acceptedAt: now, userId: user.id });
  await recordSecurityEvent(req, 'mfa-change', { userId: user.id });
  return noContent();
}

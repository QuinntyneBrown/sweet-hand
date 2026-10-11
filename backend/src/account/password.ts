import type { Request, Reply } from '../http/endpoint.ts';
import { invalid, noContent } from '../http/problems.ts';
import { queueEmail } from '../platform/outbox.ts';
import { recordSecurityEvent } from '../platform/security-log.ts';
import { hashPassword, verifyPassword } from '../platform/secrets.ts';
import type { ChangePasswordRequest } from '@contract/change-password-request.ts';
import { users } from '../identity/model.ts';
import { passwordProblem } from '../identity/passwords.ts';
import { currentUser, endSessionsOf } from '../identity/sessions.ts';

/** A new password keeps this session, ends every other one and is confirmed by email (L2-076.1). */
export async function changePassword(req: Request): Promise<Reply> {
  const user = currentUser(req);
  const body = (req.body ?? {}) as Partial<ChangePasswordRequest>;
  const current = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  if (!(await verifyPassword(user.passwordHash, current))) return invalid({ currentPassword: ['That password isn’t right'] });
  const weak = passwordProblem(body.newPassword);
  if (weak) return invalid({ newPassword: [weak] });
  await users(req.tx).put({ ...user, passwordHash: await hashPassword(String(body.newPassword)), passwordChangedAt: req.now.toISOString() });
  await endSessionsOf(req, user.id, req.actor!.sessionId);
  await queueEmail(req.tx, req.now, { to: user.email, kind: 'password-changed' });
  await recordSecurityEvent(req, 'password-change', { userId: user.id });
  return noContent();
}

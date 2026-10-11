import type { Request, Reply } from '../http/endpoint.ts';
import { hidden, noContent, notFound, ok } from '../http/problems.ts';
import { recordSecurityEvent } from '../platform/security-log.ts';
import type { ActiveSession } from '@contract/active-session.ts';
import { sessions } from '../identity/model.ts';
import { clearSessionCookie, currentUser, isLive } from '../identity/sessions.ts';

/** The caller's own sessions: this one first, then the most recently used (L2-078.5). Never the cookie value. */
export async function listSessions(req: Request): Promise<Reply> {
  const { userId, sessionId } = req.actor!;
  const { role } = currentUser(req);
  // Only sessions still active: not ended by sign-out, revocation or a timeout (L2-078.5).
  const own = (await sessions(req.tx).find({ userId })).filter((s) => !s.pendingSecondFactor && isLive(s, role, req.now));
  const list: ActiveSession[] = own
    .map((s) => ({ id: s.id, device: s.device, lastActiveAt: s.lastActiveAt, current: s.id === sessionId }))
    .sort((a, b) => Number(b.current) - Number(a.current) || Date.parse(b.lastActiveAt) - Date.parse(a.lastActiveAt));
  return ok(list);
}

/** Ends one of the caller's own sessions; anyone else's is not found (L2-078.4, L2-078.5). */
export async function endSession(req: Request): Promise<Reply> {
  const { userId, sessionId } = req.actor!;
  const session = await sessions(req.tx).get(req.params['id']);
  if (!session) return notFound();
  if (session.userId !== userId) return hidden(session.id);
  await sessions(req.tx).delete(session.id);
  await recordSecurityEvent(req, 'session-revoked', { userId });
  if (session.id === sessionId) clearSessionCookie(req);
  return noContent();
}

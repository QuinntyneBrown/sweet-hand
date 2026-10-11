import type { Request, Reply } from '../http/endpoint.ts';
import { noContent, unauthorized } from '../http/problems.ts';
import { validEmailEventsToken } from '../platform/email-events.ts';
import { findUserByEmail, users } from '../identity/model.ts';

/**
 * POST /api/email-events (EmailEventsEndpoints, HandleEmailBounceHandler): a
 * permanent bounce marks the address undeliverable, so the next sign-in asks
 * for a new one; a temporary failure changes nothing (L2-030.3). Anonymous
 * by deliberate choice: the provider proves itself with its token.
 */
export async function receiveEmailEvent(req: Request): Promise<Reply> {
  if (!validEmailEventsToken(req.headers['x-email-events-token'])) return unauthorized();
  const body = (req.body ?? {}) as { type?: unknown; bounce?: unknown; email?: unknown };
  if (body.type !== 'bounce' || body.bounce !== 'permanent') return noContent();
  const user = await findUserByEmail(req.tx, body.email);
  if (user && !user.emailBounced) await users(req.tx).put({ ...user, emailBounced: true });
  return noContent();
}

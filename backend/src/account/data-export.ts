import { randomUUID } from 'node:crypto';
import type { Request, Reply } from '../http/router.ts';
import { currentUser } from '../identity/sessions.ts';
import { accountViewOf } from './account-view.ts';
import { dataExports } from './model.ts';

/**
 * Starts an export; the link is emailed within 24 hours and works for 7 days
 * (L2-071). One request at a time: asking again while one is being prepared
 * keeps the first.
 */
export async function requestDataExport(req: Request): Promise<Reply> {
  const user = currentUser(req);
  const pending = await dataExports(req.tx).find({ userId: user.id, status: 'Requested' });
  if (!pending.length) await dataExports(req.tx).put({ id: `exp-${randomUUID()}`, userId: user.id, requestedAt: req.now.toISOString(), status: 'Requested' });
  return { status: 202, body: await accountViewOf(req.tx, user) };
}

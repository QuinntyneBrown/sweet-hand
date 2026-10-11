import type { Request, Reply } from '../http/endpoint.ts';
import { ok } from '../http/problems.ts';
import type { LaunchRemoval } from '@contract/launch-removal.ts';
import { launchList } from './model.ts';
import { eraseEntry } from './erase.ts';
import { findLaunchToken } from './tokens.ts';
import { throttleLaunchList } from './throttle.ts';
import { TOKEN_REQUESTS_PER_HOUR } from './confirm.ts';

/** Deletes the entry a removal token names; returns its address, or nothing when there is no such entry. */
async function removeByToken(req: Request, token: unknown): Promise<LaunchRemoval> {
  await throttleLaunchList(req, 'launch-token', TOKEN_REQUESTS_PER_HOUR);
  const found = await findLaunchToken(req.tx, 'remove', token);
  const entry = found && (await launchList(req.tx).get(found.entryId));
  if (!entry) return {};
  await eraseEntry(req.tx, entry);
  return { email: entry.email };
}

/** `leaveLaunchList`: one click, no sign-in, no confirmation step (L2-100.1, L2-100.3, L2-100.5). */
export async function leaveLaunchList(req: Request): Promise<Reply> {
  return ok(await removeByToken(req, req.body?.token));
}

/**
 * `GET api/launch-list/unsubscribe` from an email. Link scanners fetch URLs,
 * so it deletes nothing and sends the person to the page that posts the token.
 */
export async function openRemovalLink(req: Request): Promise<Reply> {
  const token = req.query.get('token') ?? '';
  return { status: 303, headers: { location: `/?remove=${encodeURIComponent(token)}` } };
}

/** The RFC 8058 one-click `POST` from a mail client: authorised by its token alone, it can only delete (L2-104.3). */
export async function unsubscribeOneClick(req: Request): Promise<Reply> {
  await removeByToken(req, req.query.get('token'));
  return { status: 200 };
}

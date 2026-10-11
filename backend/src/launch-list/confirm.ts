import type { Request, Reply } from '../http/endpoint.ts';
import { gone, ok } from '../http/problems.ts';
import type { LaunchConfirmation } from '@contract/launch-confirmation.ts';
import { launchList, launchListTokens, launchState, launched } from './model.ts';
import { issueLaunchToken, liveConfirmToken } from './tokens.ts';
import { throttleLaunchList } from './throttle.ts';

export const TOKEN_REQUESTS_PER_HOUR = 30;
const expired = () => gone('That link has expired');

/**
 * `confirmLaunchListEmail` (confirm-launch-list-email design): a live,
 * unused confirmation token confirms its entry and returns a fresh removal
 * token for the page's "Remove my email" button (L2-099.2).
 */
export async function confirmLaunchListEmail(req: Request): Promise<Reply> {
  await throttleLaunchList(req, 'launch-token', TOKEN_REQUESTS_PER_HOUR);
  if (launched(await launchState(req.tx))) return expired();
  const token = await liveConfirmToken(req.tx, req.now, req.body?.token);
  const entry = token && (await launchList(req.tx).get(token.entryId));
  if (!token || !entry) return expired();
  const now = req.now.toISOString();
  await launchListTokens(req.tx).put({ ...token, consumedAt: now });
  if (entry.status !== 'Confirmed') {
    await launchList(req.tx).put({ ...entry, status: 'Confirmed', consent: { ...entry.consent, confirmedAt: now }, updatedAt: now });
  }
  const confirmation: LaunchConfirmation = { email: entry.email, removalToken: await issueLaunchToken(req.tx, req.now, entry, 'remove') };
  return ok(confirmation);
}

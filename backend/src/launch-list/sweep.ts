import type { Environment } from '../environment.ts';
import { writeLog } from '../platform/log-redactor.ts';
import { launchList } from './model.ts';
import { eraseEntry } from './erase.ts';
import { CONFIRM_LIFETIME_MS } from './tokens.ts';

/**
 * The hourly launch list retention job. A `Pending` entry whose latest
 * confirmation email is over 48 hours old is deleted with its tokens and
 * queued emails (L2-099.5). It logs counts only (L2-103.7). Returns how many
 * entries it deleted.
 */
export async function sweepLaunchList(env: Environment): Promise<number> {
  const now = env.clock.now();
  const deleted = await env.db.transaction(async (tx) => {
    let count = 0;
    for (const entry of await launchList(tx).find({ status: 'Pending' })) {
      const last = entry.confirmationsSent.at(-1) ?? entry.createdAt;
      if (now.getTime() - Date.parse(last) > CONFIRM_LIFETIME_MS) {
        await eraseEntry(tx, entry);
        count++;
      }
    }
    return count;
  });
  if (deleted) writeLog({ level: 'info', event: 'launch-list-sweep', expiredPending: deleted });
  return deleted;
}

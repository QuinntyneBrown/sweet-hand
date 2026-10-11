import type { Environment } from '../environment.ts';
import { writeLog } from '../platform/log-redactor.ts';
import { torontoDate } from '../discovery/listing.ts';
import { outbox } from '../platform/outbox.ts';
import { launchList, launchListTokens, launchState } from './model.ts';
import { eraseEntry } from './erase.ts';
import { CONFIRM_LIFETIME_MS } from './tokens.ts';

/**
 * The hourly launch list retention job. A `Pending` entry whose latest
 * confirmation email is over 48 hours old is deleted with its tokens and
 * queued emails (L2-099.5). Thirty days after launch day the whole list goes:
 * every entry, token and launch email; the launch state stays and keeps
 * sign-ups closed (L2-101.6). It logs counts only (L2-103.7). Returns how
 * many entries it deleted.
 */
export async function sweepLaunchList(env: Environment): Promise<number> {
  const now = env.clock.now();
  const deleted = await env.db.transaction(async (tx) => {
    const { launchDay } = await launchState(tx);
    if (launchDay && daysBetween(launchDay, torontoDate(now)) >= 30) {
      const entries = await launchList(tx).all();
      for (const entry of entries) await launchList(tx).delete(entry.id);
      for (const token of await launchListTokens(tx).all()) await launchListTokens(tx).delete(token.id);
      for (const mail of await outbox(tx).all()) if (mail.kind.startsWith('launch-')) await outbox(tx).delete(mail.id);
      return entries.length;
    }
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
  if (deleted) writeLog({ level: 'info', event: 'launch-list-sweep', deleted });
  return deleted;
}

const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

import type { Transaction } from '../platform/database.ts';
import { outbox } from '../platform/outbox.ts';
import { launchList, launchListTokens, type LaunchListEntry } from './model.ts';

/**
 * Deletes an entry, all its tokens and every queued launch list email to its
 * address, in the caller's transaction, so no later email reaches it (L2-100.4).
 */
export async function eraseEntry(tx: Transaction, entry: LaunchListEntry): Promise<void> {
  for (const token of await launchListTokens(tx).find({ entryId: entry.id })) await launchListTokens(tx).delete(token.id);
  for (const mail of await outbox(tx).find({ status: 'queued' })) {
    if (mail.kind.startsWith('launch-') && mail.to.toLowerCase() === entry.emailKey) await outbox(tx).delete(mail.id);
  }
  await launchList(tx).delete(entry.id);
}

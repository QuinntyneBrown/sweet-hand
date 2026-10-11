import type { Document, Transaction } from './database.ts';

/**
 * How the email provider is doing, as the outbox dispatcher last saw it:
 * `slow` when sends are backing up, `down` when the provider refuses them.
 * Actions never wait on it; they only tell people their email is queued
 * (L2-030.1, L2-091.1).
 */
export type MailServiceStatus = 'up' | 'slow' | 'down';

interface MailServiceState extends Document {
  status: MailServiceStatus;
}

const ID = 'mail-service';
const state = (tx: Transaction) => tx.collection<MailServiceState>('mailService');

export async function mailServiceStatus(tx: Transaction): Promise<MailServiceStatus> {
  return (await state(tx).get(ID))?.status ?? 'up';
}

/** Recorded by the dispatcher after each delivery attempt (and by test arrangements). */
export async function setMailServiceStatus(tx: Transaction, status: MailServiceStatus): Promise<void> {
  await state(tx).put({ id: ID, status });
}

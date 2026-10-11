import { randomUUID } from 'node:crypto';
import type { Document, Transaction } from './database.ts';
import { nextSequence } from './sequence.ts';

/**
 * An email the platform sends. It is written in the same transaction as the
 * change that causes it and delivered asynchronously (L2-030, L2-086.3), so a
 * failing email provider never fails the action (L2-091.1).
 */
export interface OutboxEmail extends Document {
  to: string;
  /** Template name, e.g. `verify-email`, `password-reset`, `new-enquiry`. */
  kind: string;
  at: string;
  /** Orders emails queued in the same instant. */
  seq: number;
  /** The link the email carries; removed once the email is sent, since it may hold a token. */
  link?: string;
  status: 'queued' | 'sent' | 'failed';
  [detail: string]: unknown;
}

export const outbox = (tx: Transaction) => tx.collection<OutboxEmail>('outbox');

export async function queueEmail(
  tx: Transaction,
  now: Date,
  email: { to: string; kind: string; link?: string } & Record<string, unknown>,
): Promise<OutboxEmail> {
  const doc: OutboxEmail = { ...email, id: `mail-${randomUUID()}`, at: now.toISOString(), seq: nextSequence(), status: 'queued' };
  await outbox(tx).put(doc);
  return doc;
}

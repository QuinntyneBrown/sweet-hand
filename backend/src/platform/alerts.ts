import { randomUUID } from 'node:crypto';
import type { Document, Transaction } from './database.ts';
import { nextSequence } from './sequence.ts';
import { writeLog } from './log-redactor.ts';

/**
 * An alert for the people on call. Kept in the `alerts` collection and written
 * as a structured `alert` log line; routing it to a person is `<TO SUPPLY>`.
 */
export interface Alert extends Document {
  kind: string;
  message: string;
  at: string;
  seq: number;
  [detail: string]: unknown;
}

export const alerts = (tx: Transaction) => tx.collection<Alert>('alerts');

export async function raiseAlert(tx: Transaction, now: Date, alert: { kind: string; message: string } & Record<string, unknown>): Promise<Alert> {
  const doc: Alert = { ...alert, id: `alert-${randomUUID()}`, at: now.toISOString(), seq: nextSequence() };
  await alerts(tx).put(doc);
  writeLog({ ...doc, level: 'alert', id: undefined, seq: undefined });
  return doc;
}

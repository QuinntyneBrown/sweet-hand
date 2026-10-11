import { randomUUID } from 'node:crypto';
import type { Document, Transaction } from './database.ts';
import { nextSequence } from './sequence.ts';

/**
 * One operator action (L2-060.1): who, what, on which record, when (UTC), why,
 * and the values before and after. The log is only ever appended to.
 */
export interface AuditEntry extends Document {
  at: string;
  /** Orders entries written in the same instant. */
  seq: number;
  operatorId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  before: unknown;
  after: unknown;
}

export const audit = (tx: Transaction) => tx.collection<AuditEntry>('audit');

export async function recordAudit(
  tx: Transaction,
  now: Date,
  entry: Pick<AuditEntry, 'operatorId' | 'action' | 'targetType' | 'targetId' | 'reason' | 'before' | 'after'>,
): Promise<AuditEntry> {
  const doc: AuditEntry = { id: `audit-${randomUUID()}`, at: now.toISOString(), seq: nextSequence(), ...entry };
  await audit(tx).put(doc);
  return doc;
}

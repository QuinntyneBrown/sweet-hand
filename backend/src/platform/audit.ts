import { randomUUID } from 'node:crypto';
import type { Request } from '../http/endpoint.ts';
import type { Document, Transaction } from './database.ts';
import { recordSecurityEvent } from './security-log.ts';
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

/**
 * Appends an operator action to the audit log and records it in the security
 * log for detection: the audit log keeps the decision, the security log the
 * event (log-security-events design, L2-084.1).
 */
export async function recordAudit(
  req: Pick<Request, 'tx' | 'now' | 'path' | 'ip' | 'correlationId' | 'actor'>,
  entry: Pick<AuditEntry, 'operatorId' | 'action' | 'targetType' | 'targetId' | 'reason' | 'before' | 'after'>,
): Promise<AuditEntry> {
  const doc: AuditEntry = { id: `audit-${randomUUID()}`, at: req.now.toISOString(), seq: nextSequence(), ...entry };
  await audit(req.tx).put(doc);
  await recordSecurityEvent(req, 'operator-action', { userId: entry.operatorId, targetId: entry.targetId });
  return doc;
}

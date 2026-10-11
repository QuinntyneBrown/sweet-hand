import { randomUUID } from 'node:crypto';
import type { Request } from '../http/endpoint.ts';
import type { Document, Transaction } from './database.ts';
import { hashIp } from './secrets.ts';
import { nextSequence } from './sequence.ts';
import { writeLog } from './log-redactor.ts';

export type SecurityEventType =
  | 'sign-in-success'
  | 'sign-in-failure'
  | 'lockout'
  | 'password-reset'
  | 'password-change'
  | 'mfa-change'
  | 'session-revoked'
  | 'authorization-failure'
  | 'rate-limit-block'
  | 'operator-action'
  | 'upload-rejected';

/**
 * A security-relevant event (L2-084.1): type, user, hashed IP, time and
 * correlation ID. Never a password, session id, token, full postal code,
 * message text or certificate number (L2-084.2).
 */
export interface SecurityEvent extends Document {
  type: SecurityEventType;
  at: string;
  seq: number;
  userId?: string;
  path: string;
  targetId?: string;
  ipHash: string;
  correlationId: string;
}

export const securityEvents = (tx: Transaction) => tx.collection<SecurityEvent>('securityEvents');

export async function recordSecurityEvent(
  req: Pick<Request, 'tx' | 'now' | 'path' | 'ip' | 'correlationId' | 'actor'>,
  type: SecurityEventType,
  details: { userId?: string; targetId?: string } = {},
): Promise<void> {
  const event: SecurityEvent = {
    id: `sec-${randomUUID()}`,
    type,
    at: req.now.toISOString(),
    seq: nextSequence(),
    userId: details.userId ?? req.actor?.userId,
    path: req.path,
    ...(details.targetId ? { targetId: details.targetId } : {}),
    ipHash: hashIp(req.ip),
    correlationId: req.correlationId,
  };
  await securityEvents(req.tx).put(event);
  writeLog({ level: 'security', ...event, id: undefined, seq: undefined });
}

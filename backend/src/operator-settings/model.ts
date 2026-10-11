import type { Document, Transaction } from '../platform/database.ts';
import type { BreachRecord } from '@contract/breach-record.ts';

/** One record of the breach register (L2-075.2): kept for at least 24 months, never edited. */
export interface Breach extends Document, BreachRecord {
  /** The operator who recorded it; `recordedBy` keeps their name as it was then. */
  recordedById: string;
}

/** An operator invited by an Admin who has not set up their account yet (L2-056). */
export interface OperatorInvitation extends Document {
  name: string;
  email: string;
  emailKey: string;
  admin: boolean;
  invitedAt: string;
  invitedBy: string;
  /** SHA-256 of the single-use link token; the token itself is only in the email. */
  tokenHash: string;
  expiresAt: string;
  deactivatedAt?: string;
}

/** When an Admin deactivated an operator account, keyed by the operator's user id (L2-056.4). */
export interface OperatorDeactivation extends Document {
  at: string;
  by: string;
}

/** Last activity of an operator from before the current sessions (sessions hold the rest), keyed by user id. */
export interface OperatorActivity extends Document {
  lastActiveAt: string;
}

export const breaches = (tx: Transaction) => tx.collection<Breach>('breaches');
export const operatorInvitations = (tx: Transaction) => tx.collection<OperatorInvitation>('operatorInvitations');
export const operatorDeactivations = (tx: Transaction) => tx.collection<OperatorDeactivation>('operatorDeactivations');
export const operatorActivity = (tx: Transaction) => tx.collection<OperatorActivity>('operatorActivity');

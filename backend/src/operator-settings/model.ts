import type { Document, Transaction } from '../platform/database.ts';
import type { BreachRecord } from '@contract/breach-record.ts';

/** One record of the breach register (L2-075.2): kept for at least 24 months, never edited. */
export interface Breach extends Document, BreachRecord {
  /** The operator who recorded it; `recordedBy` keeps their name as it was then. */
  recordedById: string;
}

export const breaches = (tx: Transaction) => tx.collection<Breach>('breaches');

import type { Document, Transaction } from '../platform/database.ts';

/**
 * One request for a copy of a user's personal information (export-personal-data
 * design). The background worker that writes the file and emails the link is
 * not built yet; until then a request stays `Requested`.
 */
export interface DataExport extends Document {
  userId: string;
  requestedAt: string;
  status: 'Requested' | 'Ready' | 'Failed';
  readyAt?: string;
  /** 7 days after the file was made (L2-071.3). */
  expiresAt?: string;
}

export const dataExports = (tx: Transaction) => tx.collection<DataExport>('dataExports');

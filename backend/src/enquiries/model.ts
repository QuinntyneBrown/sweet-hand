import type { Document, Transaction } from '../platform/database.ts';
import type { EnquiryStatus } from '@contract/enquiry-status.ts';
import type { FitWarning } from '@contract/fit-warning.ts';
import type { Party } from '@contract/party.ts';

export interface EnquiryEvent {
  id: string;
  kind: 'reply' | 'declined' | 'closed' | 'shared';
  /** Who acted; `system` only for automatic closing. */
  by: Party | 'system';
  at: string;
  text?: string;
  note?: string | null;
}

/** An event enquiry from a customer to a caterer and its thread (docs/detailed-designs/enquiries). */
export interface Enquiry extends Document {
  /** A user id; when no live user has it, the customer deleted their account (L2-072.2). */
  customerId: string;
  catererId: string;
  eventDate: string;
  guests: number;
  /** Service area id. */
  area: string;
  fsa: string | null;
  /** Occasion id. */
  occasion: string;
  message: string;
  createdAt: string;
  status: EnquiryStatus;
  events: EnquiryEvent[];
  /** When each party last opened the thread (show-unread-indicators design). */
  readAt: Partial<Record<Party, string>>;
  /** Fit warnings worked out when it was sent, so the caterer sees what the customer saw (L2-024.3). */
  fitWarnings?: FitWarning[];
}

export const enquiries = (tx: Transaction) => tx.collection<Enquiry>('enquiries');

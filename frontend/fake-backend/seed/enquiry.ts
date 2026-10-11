import type { EnquiryStatus } from '../../projects/api/src/lib/models/enquiry-status.ts';
import type { FitWarning } from '../../projects/api/src/lib/models/fit-warning.ts';
import type { Party } from '../../projects/api/src/lib/models/party.ts';
import type { EnquiryEvent } from './enquiries.ts';

export interface Enquiry {
  id: string;
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

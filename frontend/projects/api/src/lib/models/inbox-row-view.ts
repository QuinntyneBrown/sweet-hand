import type { OtherParty } from './other-party';
import type { EnquiryStatus } from './enquiry-status';

export interface InboxRowView {
  /** Random UUID (L2-034.2). */
  id: string;
  otherParty: OtherParty;
  /** YYYY-MM-DD in Toronto. */
  eventDate: string;
  guests: number;
  occasion: string;
  status: EnquiryStatus;
  lastActivityAt: string;
  unread: boolean;
}

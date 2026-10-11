import type { ThreadEntryView } from './thread-entry-view';
import type { EnquiryStatus } from './enquiry-status';

export interface ReplyResult {
  entry: Extract<ThreadEntryView, { kind: 'reply' }>;
  status: EnquiryStatus;
  /** The notification email is queued behind a slow mail service (L2-030.1). */
  emailDelayed: boolean;
}

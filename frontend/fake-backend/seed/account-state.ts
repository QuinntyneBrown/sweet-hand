import type { SentEmail } from './account.ts';
import type { AccountToken } from './account-token.ts';
import type { PrivacyNoticeVersion } from './privacy-notice-version.ts';
import type { SavedEnquiry } from './saved-enquiry.ts';
import type { SessionRecord } from './session-record.ts';
import type { DataSummary } from './data-summary.ts';
import type { SiteNotice } from '../../projects/api/src/lib/models/notices.models.ts';

export interface AccountState {
  outbox: SentEmail[];
  /** Failed sign-ins from the test's network (every request in a test shares one), for L2-076.5. */
  networkFailures: string[];
  /** Password reset requests from the test's network, for L2-082.3. */
  resetRequests: string[];
  tokens: AccountToken[];
  privacyNotice: PrivacyNoticeVersion;
  savedEnquiries: SavedEnquiry[];
  /** Session cookie → operator id, for operators who still owe the second step (L2-056.2). */
  pendingSecondFactor: Record<string, string>;
  sessions: SessionRecord[];
  dataSummaries: Record<string, DataSummary>;
  /** Data exports being prepared, by user id (L2-071). */
  dataExports: Record<string, string>;
  notices: SiteNotice[];
}

/** Account state: emails sent, sign-in attempts, sessions, tokens, privacy notice and data exports. */

/** An email the platform would have sent; tests read it (and its link) instead of a mailbox. */
export interface SentEmail {
  to: string;
  kind: string;
  at: string;
  link?: string;
}

/** A single-use email verification or password reset token (L2-077). */
export interface AccountToken {
  kind: 'verify' | 'reset';
  token: string;
  userId: string;
  issuedAt: string;
  consumedAt?: string;
}

/** A published privacy notice version (L2-070). */
export interface PrivacyNoticeVersion {
  version: string;
  effectiveDate: string;
  /** Substantially different purposes: existing users accept again at their next sign-in (L2-070.4). */
  substantialChange: boolean;
  changes: string[];
}

/** An enquiry a customer filled in before verifying their email (L2-023.3); the enquiries area owns the real drafts. */
export interface SavedEnquiry {
  userId: string;
  catererSlug: string;
  eventDate: string;
  guests: number;
}

/** What the platform knows about one session: the coarse device and when it was last used (L2-078.5). */
export interface SessionRecord {
  /** What the API calls the session; never the cookie value. */
  id: string;
  /** The session cookie value; seeded sessions on other devices have tokens no browser holds. */
  token: string;
  userId: string;
  device: string;
  createdAt: string;
  lastActiveAt: string;
}

/**
 * Counts for the export and deletion dialogs (L2-071, L2-072), from the mocks'
 * cast. The enquiries and reviews areas own the real records.
 */
export interface DataSummary {
  enquiries: number;
  reviews: number;
  reports: number;
  photos: number;
  dishes: number;
  reviewResponses: number;
  openEnquiriesWith: string[];
}

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
}

export function seedAccount(): AccountState {
  return {
    outbox: [],
    networkFailures: [],
    resetRequests: [],
    tokens: [],
    privacyNotice: { version: '2026-03', effectiveDate: '2026-03-01', substantialChange: false, changes: [] },
    savedEnquiries: [],
    pendingSecondFactor: {},
    sessions: [
      // Marcia's and Kendra's other devices (docs/mocks/pages/account).
      { id: 'ses-marcia-iphone', token: 'seed-marcia-iphone', userId: 'user-marcia', device: 'Safari on iPhone', createdAt: '2026-09-02T13:00:00Z', lastActiveAt: '2026-10-10T12:15:00Z' },
      { id: 'ses-marcia-android', token: 'seed-marcia-android', userId: 'user-marcia', device: 'Samsung Internet on Android', createdAt: '2026-09-12T16:00:00Z', lastActiveAt: '2026-09-28T22:40:00Z' },
      { id: 'ses-kendra-mac', token: 'seed-kendra-mac', userId: 'user-kendra', device: 'Chrome on Mac', createdAt: '2026-09-20T13:00:00Z', lastActiveAt: '2026-10-10T01:03:00Z' },
    ],
    dataSummaries: {
      'user-marcia': { enquiries: 4, reviews: 2, reports: 1, photos: 0, dishes: 0, reviewResponses: 0, openEnquiriesWith: [] },
      'user-kendra': { enquiries: 5, reviews: 23, reports: 0, photos: 6, dishes: 18, reviewResponses: 1, openEnquiriesWith: ['Priya', 'Andre', 'Marcia'] },
    },
    dataExports: {},
  };
}

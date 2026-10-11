import type { AccountState } from './account-state.ts';


/** Account state: emails sent, sign-in attempts, sessions, tokens, privacy notice and data exports. */

/** An email the platform would have sent; tests read it (and its link) instead of a mailbox. */
export interface SentEmail {
  to: string;
  kind: string;
  at: string;
  link?: string;
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
    notices: [],
  };
}

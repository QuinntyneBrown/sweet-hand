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

export interface AccountState {
  outbox: SentEmail[];
  /** Failed sign-ins from the test's network (every request in a test shares one), for L2-076.5. */
  networkFailures: string[];
  /** Password reset requests from the test's network, for L2-082.3. */
  resetRequests: string[];
  tokens: AccountToken[];
  privacyNotice: PrivacyNoticeVersion;
}

export function seedAccount(): AccountState {
  return {
    outbox: [],
    networkFailures: [],
    resetRequests: [],
    tokens: [],
    privacyNotice: { version: '2026-03', effectiveDate: '2026-03-01', substantialChange: false, changes: [] },
  };
}

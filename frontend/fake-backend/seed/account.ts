/** Account state: emails sent, sign-in attempts, sessions, tokens, privacy notice and data exports. */

/** An email the platform would have sent; tests read it instead of a mailbox. */
export interface SentEmail {
  to: string;
  kind: string;
  at: string;
}

export interface AccountState {
  outbox: SentEmail[];
  /** Failed sign-ins from the test's network (every request in a test shares one), for L2-076.5. */
  networkFailures: string[];
}

export function seedAccount(): AccountState {
  return {
    outbox: [],
    networkFailures: [],
  };
}

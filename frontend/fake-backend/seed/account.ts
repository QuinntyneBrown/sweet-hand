/** Account state: emails sent, sign-in attempts, sessions, tokens, privacy notice and data exports. */

/** An email the platform would have sent; tests read it instead of a mailbox. */
export interface SentEmail {
  to: string;
  kind: string;
  at: string;
}

export interface AccountState {
  outbox: SentEmail[];
}

export function seedAccount(): AccountState {
  return {
    outbox: [],
  };
}

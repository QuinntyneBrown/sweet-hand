import type { SessionUser } from './session-user';

export interface SessionView {
  user: SessionUser | null;
  /** Threads with unread messages for customers and caterers (L2-029). */
  unread: number;
  /** Items waiting in the operator review queue. */
  queueCount: number;
  /**
   * An operator whose password was right but who has not completed the second
   * step yet: `user` stays null until they do (L2-056.2).
   */
  pendingSecondFactor?: { email: string; method: 'authenticator app' | 'security key' } | null;
  /** A newer privacy notice must be accepted before anything else (L2-070.4). */
  privacyUpdateRequired?: boolean;
  /** The session just ended because an operator was idle for 30 minutes (L2-078.3). */
  expired?: { email: string } | null;
}

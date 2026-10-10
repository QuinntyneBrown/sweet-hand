/** Wire types for the signed-in session (ADR 0003). Shared with the fake backend; keep import-free. */

export type Role = 'Customer' | 'Caterer' | 'Operator';

export type ProfileStatus = 'Draft' | 'Pending review' | 'Changes requested' | 'Published' | 'Suspended' | 'Removed';

export interface SessionUser {
  id: string;
  displayName: string;
  email: string;
  role: Role;
  /** Operators with the Admin permission (L2-056.5). */
  admin: boolean;
  emailVerified: boolean;
  /** Set when a notification email bounced permanently (L2-030.3). */
  emailBounced: boolean;
  /** Caterers only: the profile they own. */
  caterer?: { id: string; name: string; slug: string; status: ProfileStatus };
  /** Operators only: how the second factor was satisfied. */
  secondFactor?: 'security key' | 'authenticator app';
}

export interface SessionView {
  user: SessionUser | null;
  /** Threads with unread messages for customers and caterers (L2-029). */
  unread: number;
  /** Items waiting in the operator review queue. */
  queueCount: number;
}

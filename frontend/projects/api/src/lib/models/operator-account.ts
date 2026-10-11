/** An operator account (manage-operator-accounts). */
export interface OperatorAccount {
  id: string;
  name: string;
  initials: string;
  email: string;
  admin: boolean;
  secondFactor: 'authenticator app' | 'security key' | null;
  status: 'Active' | 'Invited' | 'Deactivated';
  /** UTC; absent when never signed in. */
  lastActiveAt?: string | null;
  invitedAt?: string | null;
  deactivatedAt?: string | null;
  /** The signed-in operator's own row. */
  self: boolean;
}

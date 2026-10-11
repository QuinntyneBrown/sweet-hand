import type { Role } from './role';
import type { ProfileStatus } from './profile-status';

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

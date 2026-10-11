import type { Role } from './users.ts';

export interface User {
  id: string;
  role: Role;
  displayName: string;
  email: string;
  phone?: string;
  password: string;
  passwordChangedAt: string;
  emailVerified: boolean;
  /** When the latest verification link was sent (L2-023.2). */
  verificationSentAt?: string;
  emailBounced?: boolean;
  /** Operators only. */
  admin?: boolean;
  /** Operators only: how they complete the second step (L2-056.2). */
  secondFactor?: 'authenticator app' | 'security key';
  /** Caterers only: the profile they own. */
  catererId?: string;
  createdAt: string;
  deleted?: boolean;
  /** Privacy notice version the user accepted, and when (L2-070.3). */
  acceptedPrivacyVersion: string;
  acceptedPrivacyAt: string;
  failedSignIns?: number;
  /** When each recent failed sign-in happened (L2-076.4). */
  failedSignInsAt?: string[];
  lockedUntil?: string;
}

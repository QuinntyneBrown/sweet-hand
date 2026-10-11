import type { Document, Transaction } from '../platform/database.ts';
import type { Role } from '../http/router.ts';

export type SecondFactorMethod = 'authenticator app' | 'security key';

export interface User extends Document {
  role: Role;
  displayName: string;
  email: string;
  /** Lower-cased email, for lookups. */
  emailKey: string;
  phone?: string;
  /** Argon2id (L2-076.2). */
  passwordHash: string;
  passwordChangedAt: string;
  emailVerified: boolean;
  /** When the latest verification link was sent (L2-023.2). */
  verificationSentAt?: string;
  emailBounced?: boolean;
  /** Operators only. */
  admin?: boolean;
  /** Operators only: how they complete the second step (L2-056.2). */
  secondFactor?: SecondFactorMethod;
  /** Operators with an authenticator app: the base32 TOTP secret. */
  totpSecret?: string;
  /** Caterers only: the profile they own. */
  catererId?: string;
  createdAt: string;
  deleted?: boolean;
  /** When the owner deleted the account (L2-072). */
  deletedAt?: string;
  /** Privacy notice version the user accepted, and when (L2-070.3). */
  acceptedPrivacyVersion: string;
  acceptedPrivacyAt: string;
  /** Recent failed sign-ins (L2-076.4). */
  failedSignInsAt?: string[];
  lockedUntil?: string | null;
}

/** One sign-in. The cookie holds a random token; only its hash is stored. */
export interface Session extends Document {
  tokenHash: string;
  userId: string;
  /** Coarse device type, never the user agent (manage-sessions design). */
  device: string;
  createdAt: string;
  lastActiveAt: string;
  /** An operator who still owes the second step (L2-056.2). */
  pendingSecondFactor?: boolean;
  /** Timed out; kept only until the session check has told the user why (L2-078.3). */
  expired?: boolean;
}

/** A single-use email verification or password reset token; only its hash is stored (L2-077.5). */
export interface AccountToken extends Document {
  kind: 'verify' | 'reset';
  tokenHash: string;
  userId: string;
  issuedAt: string;
  consumedAt?: string | null;
}

export const users = (tx: Transaction) => tx.collection<User>('users');
export const sessions = (tx: Transaction) => tx.collection<Session>('sessions');
export const accountTokens = (tx: Transaction) => tx.collection<AccountToken>('accountTokens');

export async function findUserByEmail(tx: Transaction, email: unknown): Promise<User | undefined> {
  const key = String(email ?? '').trim().toLowerCase();
  if (!key) return undefined;
  return (await users(tx).find({ emailKey: key })).find((u) => !u.deleted);
}

export async function liveUser(tx: Transaction, id: string | undefined): Promise<User | undefined> {
  const user = id ? await users(tx).get(id) : undefined;
  return user && !user.deleted ? user : undefined;
}

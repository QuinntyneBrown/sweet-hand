import { randomUUID } from 'node:crypto';
import type { Request } from '../http/router.ts';
import type { Transaction } from '../platform/database.ts';
import { queueEmail } from '../platform/outbox.ts';
import { randomToken, sha256 } from '../platform/secrets.ts';
import { accountTokens, users, type AccountToken, type User } from './model.ts';

const MINUTE = 60_000;
/** Reset links work once, for 30 minutes (L2-077.2); verification links for 24 hours (L2-077.3). */
const LIFETIME: Record<AccountToken['kind'], number> = { reset: 30 * MINUTE, verify: 24 * 60 * MINUTE };

/** Issues a single-use token and voids earlier unused ones of the same kind. Only the hash is stored (L2-077.5). */
export async function issueToken(tx: Transaction, now: Date, user: User, kind: AccountToken['kind']): Promise<string> {
  for (const t of await accountTokens(tx).find({ userId: user.id, kind })) {
    if (!t.consumedAt) await accountTokens(tx).put({ ...t, consumedAt: now.toISOString() });
  }
  const token = randomToken();
  await accountTokens(tx).put({ id: `tok-${randomUUID()}`, kind, tokenHash: sha256(token), userId: user.id, issuedAt: now.toISOString() });
  return token;
}

/** The token record for a raw token, used or not. */
export async function findToken(tx: Transaction, kind: AccountToken['kind'], token: unknown): Promise<AccountToken | undefined> {
  if (typeof token !== 'string' || !token) return undefined;
  return accountTokens(tx).findOne({ kind, tokenHash: sha256(token) });
}

/** The unused, unexpired token, or undefined. */
export async function liveToken(tx: Transaction, now: Date, kind: AccountToken['kind'], token: unknown): Promise<AccountToken | undefined> {
  const t = await findToken(tx, kind, token);
  if (!t || t.consumedAt || now.getTime() - Date.parse(t.issuedAt) > LIFETIME[kind]) return undefined;
  return t;
}

export async function consumeToken(tx: Transaction, now: Date, token: AccountToken): Promise<void> {
  await accountTokens(tx).put({ ...token, consumedAt: now.toISOString() });
}

/** Emails a fresh verification link (L2-023.2); returns the link. */
export async function sendVerification(req: Pick<Request, 'tx' | 'now'>, user: User): Promise<string> {
  const link = `/verify-email/${await issueToken(req.tx, req.now, user, 'verify')}`;
  await users(req.tx).put({ ...user, verificationSentAt: req.now.toISOString() });
  await queueEmail(req.tx, req.now, { to: user.email, kind: 'verify-email', link });
  return link;
}

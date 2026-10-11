import { randomUUID } from 'node:crypto';
import type { Transaction } from '../platform/database.ts';
import { randomToken, sha256 } from '../platform/secrets.ts';
import { launchListTokens, type LaunchListEntry, type LaunchListToken } from './model.ts';

/** Confirmation links work once, for 48 hours (L2-099); removal tokens last as long as their entry (L2-104.2). */
export const CONFIRM_LIFETIME_MS = 48 * 60 * 60_000;

/**
 * Issues a 256-bit token and stores only its hash (L2-104.2). A new
 * confirmation token voids the entry's earlier unused ones (L2-098.4).
 */
export async function issueLaunchToken(tx: Transaction, now: Date, entry: LaunchListEntry, kind: LaunchListToken['kind']): Promise<string> {
  if (kind === 'confirm') {
    for (const t of await launchListTokens(tx).find({ entryId: entry.id, kind })) {
      if (!t.consumedAt) await launchListTokens(tx).put({ ...t, consumedAt: now.toISOString() });
    }
  }
  const token = randomToken();
  await launchListTokens(tx).put({ id: `llt-${randomUUID()}`, entryId: entry.id, kind, tokenHash: sha256(token), issuedAt: now.toISOString() });
  return token;
}

/**
 * The token record for a raw token. It is found by the SHA-256 digest of a
 * 256-bit value, so lookup timing reveals nothing usable (L2-104.2).
 */
export async function findLaunchToken(tx: Transaction, kind: LaunchListToken['kind'], token: unknown): Promise<LaunchListToken | undefined> {
  if (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) return undefined;
  return launchListTokens(tx).findOne({ kind, tokenHash: sha256(token) });
}

/** An unused confirmation token less than 48 hours old. */
export async function liveConfirmToken(tx: Transaction, now: Date, token: unknown): Promise<LaunchListToken | undefined> {
  const t = await findLaunchToken(tx, 'confirm', token);
  if (!t || t.consumedAt || now.getTime() - Date.parse(t.issuedAt) >= CONFIRM_LIFETIME_MS) return undefined;
  return t;
}

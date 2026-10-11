/** Shared pieces of the operator moderation views (docs/detailed-designs/moderation). */
import type { Transaction } from '../platform/database.ts';
import { caterers, type Caterer } from '../caterers/model.ts';
import { users, type User } from '../identity/model.ts';
import { allCuisines } from '../discovery/taxonomy.ts';
import { torontoDate } from '../discovery/listing.ts';
import { historyOf, type StatusChange } from './model.ts';
import type { OwnerView } from '@contract/owner-view.ts';
import type { ReviewCertificateView } from '@contract/review-certificate-view.ts';

export const PAGE_SIZE = 20;
export const DAY_MS = 24 * 3600_000;

export function pageNumber(query: URLSearchParams): number {
  const n = Number(query.get('page') ?? '1');
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** One page of `all`; a page past the end gives the last page. */
export function paginate<T>(all: T[], requested: number) {
  const pageCount = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = Math.min(requested, pageCount);
  return { items: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: all.length, page, pageSize: PAGE_SIZE, pageCount };
}

export const coverOf = (c: Caterer): string | null => (c.photos[0] ? `/media/${c.photos[0].file}?w=400&fm=jpeg` : null);

/** Whole calendar days in Toronto between `since` and now. */
export function calendarDays(now: Date, since: string): number {
  return Math.round((Date.parse(torontoDate(now)) - Date.parse(torontoDate(new Date(since)))) / DAY_MS);
}

/** An item is late once it has waited 3 days or more: the promise made to caterers (L2-039). */
export const isLate = (now: Date, since: string) => calendarDays(now, since) >= 3;

/** Cuisine id → name, retired ones included. */
export async function cuisineNames(tx: Transaction): Promise<(id: string) => string> {
  const all = await allCuisines(tx);
  return (id) => all.find((c) => c.id === id)?.name ?? id;
}

export const findCaterer = (tx: Transaction, id: string) => caterers(tx).get(id);

/** The account that owns a caterer profile, if it still exists. */
export async function ownerAccount(tx: Transaction, c: Caterer): Promise<User | undefined> {
  const byId = c.ownerUserId ? await users(tx).get(c.ownerUserId) : undefined;
  const owner = byId ?? (await users(tx).find({ catererId: c.id })).find((u) => u.role === 'Caterer');
  return owner && !owner.deleted ? owner : undefined;
}

/**
 * Who `by` names: history entries hold a user id; entries for someone without
 * an account hold their name.
 */
export async function nameOf(tx: Transaction, by: string): Promise<string> {
  return (by && (await users(tx).get(by))?.displayName) || by;
}

/**
 * The statuses a profile went through, oldest first. Profiles that predate the
 * history (scenario-made ones) get one derived from their dates.
 */
export async function statusHistoryOf(tx: Transaction, c: Caterer): Promise<StatusChange[]> {
  const stored = await historyOf(tx, c.id);
  if (stored.length) return stored;
  const owner = await ownerAccount(tx, c);
  const derived: StatusChange[] = [{ id: `derived-${c.id}-created`, catererId: c.id, at: c.createdAt, seq: 0, status: 'Draft', by: owner?.id ?? c.certificate?.holder ?? '', step: 'created' }];
  if (c.publishedAt) derived.push({ id: `derived-${c.id}-approved`, catererId: c.id, at: c.publishedAt, seq: 1, status: 'Published', by: 'user-leah', step: 'approved' });
  return derived;
}

/**
 * The owner's contact details as operators see them (never public, L2-014).
 * A profile whose owner account is gone shows the business contact it gave.
 */
export async function ownerView(tx: Transaction, c: Caterer): Promise<OwnerView> {
  const user = await ownerAccount(tx, c);
  const history = await statusHistoryOf(tx, c);
  const since = history.find((h) => h.status === 'Published')?.at ?? c.publishedAt ?? user?.createdAt ?? c.createdAt;
  if (user) return { name: user.displayName, email: user.email, emailVerified: user.emailVerified, phone: user.phone ?? null, since };
  return { name: c.certificate?.holder ?? c.name, email: c.businessEmail ?? '', emailVerified: true, phone: c.businessPhone ?? null, since };
}

export function certificateView(now: Date, c: Caterer): ReviewCertificateView | null {
  const cert = c.certificate;
  if (!cert) return null;
  return {
    holder: cert.holder,
    issuer: cert.issuer,
    number: cert.number,
    expires: cert.expires,
    expired: cert.expires < torontoDate(now),
    fileName: cert.fileName ?? null,
    fileSize: cert.fileSize ?? null,
  };
}

export const trimmed = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/** "Devon Walters" → "Devon W." (L2-051.3). */
export function reviewerLabel(name: string): string {
  const words = name.trim().split(/\s+/);
  return words.length > 1 ? `${words[0]} ${words[words.length - 1][0]}.` : words[0];
}

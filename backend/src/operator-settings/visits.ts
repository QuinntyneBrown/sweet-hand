import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import type { Request, Reply } from '../http/endpoint.ts';
import { noContent } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { torontoDate } from '../discovery/listing.ts';
import { caterers } from '../caterers/model.ts';
import { visits, visitSalts, type PageType, type VisitRecord } from './model.ts';

/**
 * count-visits (L2-062): a first-party beacon reports a page load. No cookie,
 * no user id, no raw IP address or user agent is kept: only a hash keyed by a
 * salt that lives for one Toronto day, so a browser cannot be linked across days.
 */

const PAGE_TYPES: PageType[] = ['Listing', 'CatererPage'];

/** CrawlerDetector: known crawlers and bots by user agent (L2-062.3). */
const CRAWLERS =
  /googlebot|google-inspectiontool|bingbot|bingpreview|slurp|duckduckbot|baiduspider|yandex(bot)?|applebot|facebookexternalhit|twitterbot|linkedinbot|ahrefsbot|semrushbot|mj12bot|petalbot|gptbot|ccbot|claudebot|bytespider|\b(bot|crawler|spider)\b/i;

export const isCrawler = (userAgent: string): boolean => !userAgent.trim() || CRAWLERS.test(userAgent);

/** DailySaltProvider: today's salt, created on first use; earlier days' salts are deleted so no hash links across days. */
async function todaysSalt(tx: Transaction, now: Date): Promise<string> {
  const today = torontoDate(now);
  const existing = await visitSalts(tx).get(today);
  if (existing) return existing.salt;
  for (const old of await visitSalts(tx).all()) if (old.id < today) await visitSalts(tx).delete(old.id);
  const salt = randomBytes(32).toString('hex');
  await visitSalts(tx).put({ id: today, salt });
  return salt;
}

/** VisitorHash: keyed one-way hash of the IP address and full user agent. */
const visitorHash = (salt: string, ip: string, userAgent: string) => createHmac('sha256', salt).update(`${ip}\n${userAgent}`).digest('hex');

/** Always 204, so the answer never says whether a visit counted. */
export async function recordVisit(req: Request): Promise<Reply> {
  const body = (req.body ?? {}) as { pageType?: unknown; catererId?: unknown };
  const userAgent = String(req.headers['user-agent'] ?? '');
  const pageType = PAGE_TYPES.find((p) => p === body.pageType);
  if (!pageType || isCrawler(userAgent)) return noContent();
  let catererId: string | undefined;
  if (pageType === 'CatererPage') {
    const caterer = typeof body.catererId === 'string' ? await caterers(req.tx).get(body.catererId) : undefined;
    if (!caterer || caterer.status !== 'Published') return noContent();
    catererId = caterer.id;
  }
  const visit: VisitRecord = {
    id: `visit-${randomUUID()}`,
    dailyHash: visitorHash(await todaysSalt(req.tx, req.now), req.ip, userAgent),
    pageType,
    ...(catererId ? { catererId } : {}),
    occurredAt: req.now.toISOString(),
  };
  await visits(req.tx).put(visit);
  return noContent();
}

/** Visits recorded per Toronto day: listing and caterer page loads, and distinct visitors. */
export async function visitsByDay(tx: Transaction): Promise<Map<string, { listing: number; caterer: number; unique: number }>> {
  const days = new Map<string, { listing: number; caterer: number; hashes: Set<string> }>();
  for (const v of await visits(tx).all()) {
    const day = torontoDate(new Date(v.occurredAt));
    let d = days.get(day);
    if (!d) days.set(day, (d = { listing: 0, caterer: 0, hashes: new Set() }));
    if (v.pageType === 'Listing') d.listing++;
    else d.caterer++;
    d.hashes.add(v.dailyHash);
  }
  return new Map([...days].map(([day, d]) => [day, { listing: d.listing, caterer: d.caterer, unique: d.hashes.size }]));
}

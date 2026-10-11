import { randomUUID } from 'node:crypto';
import type { Request, Reply } from '../http/endpoint.ts';
import type { Environment } from '../environment.ts';
import type { Transaction } from '../platform/database.ts';
import { currentUser } from '../identity/sessions.ts';
import { liveUser, type User } from '../identity/model.ts';
import { notFound, hidden } from '../http/problems.ts';
import { PRIVATE_MEDIA } from '../platform/media.ts';
import { queueEmail } from '../platform/outbox.ts';
import { raiseAlert } from '../platform/alerts.ts';
import { caterers } from '../caterers/model.ts';
import { enquiries } from '../enquiries/model.ts';
import { threadView } from '../enquiries/views.ts';
import { reviews } from '../reviews/model.ts';
import { reports } from '../reports/model.ts';
import { consentsOf } from '../identity/privacy.ts';
import { accountViewOf } from './account-view.ts';
import { dataExports, type DataExport } from './model.ts';

/** How long a ready export can be downloaded (L2-071.3). */
const EXPORT_LIFETIME_MS = 7 * 24 * 60 * 60_000;
const fileOf = (x: Pick<DataExport, 'id'>) => `${PRIVATE_MEDIA}export-${x.id}.json`;

/**
 * Starts an export; the link is emailed within 24 hours and works for 7 days
 * (L2-071). One request at a time: asking again while one is being prepared
 * keeps the first.
 */
export async function requestDataExport(req: Request): Promise<Reply> {
  const user = currentUser(req);
  const pending = await dataExports(req.tx).find({ userId: user.id, status: 'Requested' });
  if (!pending.length) await dataExports(req.tx).put({ id: `exp-${randomUUID()}`, userId: user.id, requestedAt: req.now.toISOString(), status: 'Requested' });
  return { status: 202, body: await accountViewOf(req.tx, user) };
}

/**
 * PersonalDataCollector: the person's data in role-specific sections. Enquiry
 * threads are the views the person already sees, so another party's email or
 * phone appears only where that party shared it in the thread
 * (ContactDisclosureFilter, L2-071.1–2, L2-071.4).
 */
async function collect(tx: Transaction, user: User, now: Date): Promise<Record<string, unknown>> {
  const account = { displayName: user.displayName, email: user.email, phone: user.phone ?? null, role: user.role, createdAt: user.createdAt, emailVerified: user.emailVerified };
  const consents = await consentsOf(tx, user);
  if (user.role === 'Caterer' && user.catererId) {
    const c = await caterers(tx).get(user.catererId);
    const threads = c ? await enquiries(tx).find({ catererId: c.id }) : [];
    const ownReviews = c ? await reviews(tx).find({ catererId: c.id }) : [];
    return {
      exportedAt: now.toISOString(),
      account,
      consents,
      caterer: c && {
        name: c.name,
        slug: c.slug,
        status: c.status,
        description: c.description,
        cuisines: c.cuisines,
        areas: c.areas,
        occasions: c.occasions,
        minGuests: c.minGuests,
        maxGuests: c.maxGuests,
        businessEmail: c.businessEmail ?? null,
        businessPhone: c.businessPhone ?? null,
        dishes: c.dishes,
        photos: c.photos.map((p) => ({ fileName: p.fileName, caption: p.caption ?? '', url: `/media/${p.file}` })),
        certificate: c.certificate ? { ...c.certificate, fileMediaId: undefined } : null,
      },
      enquiries: await Promise.all(threads.map((e) => threadView(tx, e, 'caterer', now))),
      reviewResponses: ownReviews.filter((r) => r.response).map((r) => ({ reviewId: r.id, response: r.response })),
    };
  }
  const threads = await enquiries(tx).find({ customerId: user.id });
  return {
    exportedAt: now.toISOString(),
    account,
    consents,
    enquiries: await Promise.all(threads.map((e) => threadView(tx, e, 'customer', now))),
    reviews: (await reviews(tx).find({ authorUserId: user.id })).map((r) => ({ id: r.id, catererId: r.catererId, rating: r.rating, text: r.text, eventDate: r.eventDate, createdAt: r.createdAt, status: r.status })),
    reports: (await reports(tx).find({ reporterUserId: user.id })).map((r) => ({ id: r.id, targetKind: r.targetKind, targetId: r.targetId, reason: r.reason, details: r.details ?? null, createdAt: r.createdAt, status: r.status })),
  };
}

/**
 * GenerateDataExportJob: builds each requested export as a private JSON file,
 * marks it ready for 7 days and emails the link. A failure marks it failed
 * and alerts the people on call.
 */
export async function generateDataExports(env: Environment): Promise<number> {
  const requested = await env.db.transaction(async (tx) => (await dataExports(tx).find({ status: 'Requested' })).map((x) => x.id));
  let ready = 0;
  for (const id of requested) {
    const now = env.clock.now();
    try {
      await env.db.transaction(async (tx) => {
        const x = await dataExports(tx).get(id);
        const user = x && x.status === 'Requested' ? await liveUser(tx, x.userId) : undefined;
        if (!x || !user) return;
        const json = JSON.stringify(await collect(tx, user, now), null, 2);
        await env.media.put(fileOf(x), { contentType: 'application/json', bytes: Buffer.from(json) });
        await dataExports(tx).put({ ...x, status: 'Ready', readyAt: now.toISOString(), expiresAt: new Date(now.getTime() + EXPORT_LIFETIME_MS).toISOString() });
        await queueEmail(tx, now, { to: user.email, kind: 'data-export-ready', link: `/account/data-exports/${x.id}` });
        ready++;
      });
    } catch (err) {
      await env.db.transaction(async (tx) => {
        const x = await dataExports(tx).get(id);
        if (x) await dataExports(tx).put({ ...x, status: 'Failed' });
        await raiseAlert(tx, now, { kind: 'data-export-failed', message: `Data export ${id} could not be built: ${(err as Error).message}` });
      });
    }
  }
  return ready;
}

/** CanBeDownloadedBy: the owner, while the export is ready and not expired. */
const canBeDownloadedBy = (x: DataExport, userId: string, now: Date) => x.userId === userId && x.status === 'Ready' && !!x.expiresAt && now.getTime() < Date.parse(x.expiresAt);

/** GET /api/me/data-exports/:id/download — anyone but the owner, or after expiry, gets the not-found response. */
export async function downloadDataExport(req: Request): Promise<Reply> {
  const user = currentUser(req);
  const x = await dataExports(req.tx).get(req.params['id'] ?? '');
  if (!x) return notFound();
  if (x.userId !== user.id) return hidden(x.id);
  if (!canBeDownloadedBy(x, user.id, req.now)) return notFound();
  const file = await req.env.media.get(fileOf(x));
  if (!file) return notFound();
  return {
    status: 200,
    raw: file.bytes,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="sweet-hand-data-${(x.readyAt ?? '').slice(0, 10)}.json"`,
      'cache-control': 'no-store',
    },
  };
}

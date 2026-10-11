/** Opening a profile or a name change for a decision (work-review-queue, decide-profile-approval designs). */
import { randomBytes } from 'node:crypto';
import type { Request, Reply } from '../http/endpoint.ts';
import { notFound, ok } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { sha256 } from '../platform/secrets.ts';
import { slugify, type Caterer } from '../caterers/model.ts';
import { areaName, occasionName, REGION_LIST } from '../discovery/taxonomy.ts';
import { certificateLinks, profileSnapshots, type StatusChange } from './model.ts';
import { submissionOf } from './queue.ts';
import { certificateView, coverOf, cuisineNames, findCaterer, nameOf, ownerView, statusHistoryOf } from './views.ts';
import type { NameChangeReviewView } from '@contract/name-change-review-view.ts';
import type { PublicProfileView } from '@contract/public-profile-view.ts';
import type { ReviewHistoryView } from '@contract/review-history-view.ts';
import type { SubmissionReviewView } from '@contract/submission-review-view.ts';

const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

async function publicProfile(tx: Transaction, c: Caterer): Promise<PublicProfileView> {
  const snapshot = await profileSnapshots(tx).get(c.id);
  const cuisine = await cuisineNames(tx);
  const now = paragraphs(c.description);
  return {
    name: c.name,
    cuisines: c.cuisines.map(cuisine),
    description: now,
    removedParagraphs: snapshot ? paragraphs(snapshot.description).filter((p) => !now.includes(p)) : [],
    minGuests: c.minGuests,
    maxGuests: c.maxGuests,
    occasions: c.occasions.map(occasionName),
    photos: c.photos.map((p, j) => ({ id: p.id, src: `/media/${p.file}?w=400&fm=jpeg`, caption: p.caption, cover: j === 0, isNew: !!snapshot && !snapshot.photoFiles.includes(p.file) })),
    dishes: c.dishes.map((d) => ({ name: d.name, description: d.description ?? null, price: d.price ?? null, tags: d.tags })),
    regions: REGION_LIST.map((rg) => ({ name: rg.name, areas: c.areas.filter((id) => rg.areas.some((a) => a.id === id)).map(areaName) })).filter((rg) => rg.areas.length > 0),
  };
}

/** Fields that changed since the last "Changes requested" decision (L2-047.3). */
async function changedFields(tx: Transaction, c: Caterer): Promise<string[]> {
  const s = await profileSnapshots(tx).get(c.id);
  if (!s) return [];
  const same = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
  return [
    s.description !== c.description && 'description',
    (!same(s.photoFiles, c.photos.map((p) => p.file)) || (s.captions && !same(s.captions, c.photos.map((p) => p.caption)))) && 'photos',
    (!same(s.dishNames, c.dishes.map((d) => d.name)) || (s.dishes && !same(s.dishes, c.dishes.map((d) => JSON.stringify(d))))) && 'menu',
    (s.minGuests !== c.minGuests || s.maxGuests !== c.maxGuests) && 'guests',
    !same(s.occasions, c.occasions) && 'occasions',
    !same(s.areas, c.areas) && 'areas',
    !same(s.cuisines, c.cuisines) && 'cuisines',
    s.certificate !== undefined && s.certificate !== JSON.stringify(c.certificate ?? null) && 'certificate',
  ].filter((x): x is string => !!x);
}

async function reviewHistory(tx: Transaction, entries: StatusChange[]): Promise<ReviewHistoryView[]> {
  const views: ReviewHistoryView[] = [];
  for (const h of entries) {
    if (h.step === 'created') views.push({ at: h.at, step: 'created', by: null, reason: null });
    else if (h.step === 'submitted' || h.step === 'resubmitted') views.push({ at: h.at, step: h.step, by: await nameOf(tx, h.by), reason: null });
    else if (h.step === 'changes-requested') views.push({ at: h.at, step: 'changes-requested', by: await nameOf(tx, h.by), reason: h.reason ?? null });
    else views.push({ at: h.at, step: 'published', by: await nameOf(tx, h.by), reason: null });
  }
  return views.reverse();
}

async function submissionReview(tx: Transaction, now: Date, c: Caterer): Promise<SubmissionReviewView> {
  const history = await statusHistoryOf(tx, c);
  const s = await submissionOf(tx, c);
  const request = s.resubmitted ? [...history].reverse().find((h) => h.step === 'changes-requested') : undefined;
  const changed = s.resubmitted ? await changedFields(tx, c) : [];
  const contact = await ownerView(tx, c);
  const certificate = certificateView(now, c);
  const description = c.description.trim().length;
  return {
    kind: 'submission',
    id: c.id,
    name: c.name,
    status: c.status,
    cover: coverOf(c),
    submittedAt: s.at,
    resubmitted: s.resubmitted,
    changesRequested: request ? { by: await nameOf(tx, request.by), at: request.at, reason: request.reason ?? '' } : null,
    changedFields: changed.length,
    descriptionChanged: changed.includes('description'),
    profile: await publicProfile(tx, c),
    contact,
    certificate,
    checks: {
      emailVerified: contact.emailVerified,
      photos: c.photos.length,
      photosComplete: c.photos.length >= 3 && c.photos.length <= 30 && c.photos.every((p) => p.caption.trim()),
      dishes: c.dishes.length,
      detailsComplete: description >= 50 && description <= 2000 && c.cuisines.length > 0 && c.areas.length > 0 && c.minGuests > 0 && c.occasions.length > 0,
      certificateValid: !!certificate && !certificate.expired,
    },
    history: await reviewHistory(tx, history.filter((h) => h.step !== 'reinstated' && h.step !== 'suspended' && h.step !== 'removed')),
  };
}

async function nameChangeReview(tx: Transaction, now: Date, c: Caterer): Promise<NameChangeReviewView> {
  const owner = (await ownerView(tx, c)).name;
  const requestedAt = c.pendingNameAt ?? now.toISOString();
  const published = (await statusHistoryOf(tx, c)).reverse().find((h) => h.step === 'approved' || h.step === 'reinstated');
  const history: ReviewHistoryView[] = [{ at: requestedAt, step: 'name-change-requested', by: owner, reason: null }];
  if (published) history.push({ at: published.at, step: 'published', by: await nameOf(tx, published.by), reason: null });
  const cuisine = await cuisineNames(tx);
  return {
    kind: 'name-change',
    id: c.id,
    name: c.name,
    newName: c.pendingName!,
    status: c.status,
    slug: c.slug,
    newSlug: slugify(c.pendingName!),
    requestedAt,
    requestedBy: owner,
    owner,
    card: { photo: coverOf(c) ?? '', alt: c.photos[0]?.caption ?? '', cuisine: cuisine(c.cuisines[0]), area: areaName(c.areas[0]) },
    history,
  };
}

/** GET /api/operator/queue/profiles/:id — only what waits for a decision. */
export async function profileForReview(req: Request): Promise<Reply> {
  const c = await findCaterer(req.tx, req.params['id']);
  if (c?.status === 'Pending review') return ok(await submissionReview(req.tx, req.now, c));
  if (c?.pendingName && c.status !== 'Removed') return ok(await nameChangeReview(req.tx, req.now, c));
  return notFound();
}

const LINK_LIFETIME_MS = 5 * 60_000;

/** GET /api/operator/profiles/:id/certificate-file — redirects to a link that stops working after 5 minutes (L2-040.4). */
export async function certificateFileLink(req: Request): Promise<Reply> {
  const c = await findCaterer(req.tx, req.params['id']);
  if (!c?.certificate?.fileName) return notFound();
  const token = randomBytes(16).toString('hex');
  const expiresAt = new Date(req.now.getTime() + LINK_LIFETIME_MS).toISOString();
  await certificateLinks(req.tx).put({ id: sha256(token), catererId: c.id, expiresAt });
  return { status: 302, headers: { location: `/api/operator/certificate-files/${token}?expires=${encodeURIComponent(expiresAt)}`, 'cache-control': 'no-store' } };
}

/** A minimal PDF standing in for seeded certificates that have no uploaded copy. */
const STAND_IN_PDF = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n';

/** GET /api/operator/certificate-files/:token — an unknown or expired link is 404 (L2-040.4). */
export async function certificateFile(req: Request): Promise<Reply> {
  const link = await certificateLinks(req.tx).get(sha256(req.params['token']));
  if (!link || Date.parse(link.expiresAt) < req.now.getTime()) return notFound();
  const c = await findCaterer(req.tx, link.catererId);
  if (!c?.certificate?.fileName) return notFound();
  const stored = c.certificate.fileMediaId ? await req.env.media.get(c.certificate.fileMediaId) : undefined;
  return {
    status: 200,
    raw: stored?.bytes ?? STAND_IN_PDF,
    headers: { 'content-type': stored?.contentType ?? 'application/pdf', 'cache-control': 'no-store' },
  };
}

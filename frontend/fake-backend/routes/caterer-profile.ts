import type { Router } from '../lib/router.ts';
import { conflict, forbidden, invalid, notFound, ok, unauthorized, type Ctx, type Reply } from '../lib/http.ts';
import { currentUser, newId, torontoDate, type Store } from '../lib/store.ts';
import type { Caterer, Dish, Photo } from '../seed/caterers.ts';
import type { User } from '../seed/users.ts';
import { OCCASIONS } from '../seed/taxonomy.ts';
import { sendEmail } from './identity.ts';
import { reviewerLabel } from './reviews.ts';
import type {
  AttentionView,
  CertificateView,
  ChecklistItemView,
  ChecklistKey,
  DietaryTagId,
  OwnPhotoView,
  OwnProfileView,
  OwnReviewPageView,
  OwnReviewView,
  ReferenceDataView,
  SubmissionProblem,
} from '../../projects/web/src/app/core/api/caterer-profile.models.ts';

// ---------------------------------------------------------------------------
// Limits and messages (L2-007, L2-010, L2-020, L2-021, L2-039 to L2-044, L2-052)
// ---------------------------------------------------------------------------

const MAX_PHOTOS = 30;
const MIN_PUBLISHED = 3;
const MAX_DISHES = 50;
const PHOTO_BYTES = 15 * 1024 * 1024;
const CERTIFICATE_BYTES = 10 * 1024 * 1024;
const DIETARY: DietaryTagId[] = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal', 'contains-nuts', 'contains-shellfish', 'spicy'];
const PHOTO_SIZE = 'Photos must be under 15 MB and at least 800 pixels on the shorter side';
const PHOTO_TYPE = 'This file isn’t a JPEG, PNG, WebP or HEIC photo, so nothing was saved';
const CHECKLIST_ORDER: ChecklistKey[] = ['email', 'name', 'description', 'cuisines', 'areas', 'guests', 'occasions', 'photos', 'menu', 'certificate'];
/** Images the fake serves for uploads; it never stores the uploaded bytes. */
const UPLOAD_FILES = ['roti-road', 'oil-down-kitchen', 'accra-and-floats', 'sea-moss-and-spice', 'conkie-corner', 'paramaribo-pot', 'griot-and-pikliz', 'garlic-pork-co'];

/** Per-test state that is not part of the shared store: image processing health and removed photos for Undo. */
interface ProfileExtras {
  processingDown: boolean;
  trash: Map<string, { photo: Photo; index: number }>;
  uploads: number;
}
const extras = new WeakMap<Store, ProfileExtras>();
function extra(store: Store): ProfileExtras {
  let e = extras.get(store);
  if (!e) {
    e = { processingDown: false, trash: new Map(), uploads: 0 };
    extras.set(store, e);
  }
  return e;
}

const length = (s: unknown) => (typeof s === 'string' ? s.trim().length : 0);
const text = (s: unknown) => (typeof s === 'string' ? s.trim() : '');

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

function rendition(photo: Photo, size: number) {
  const base = `/media/${photo.file}`;
  return { src: `${base}?w=400&fm=jpeg`, srcset: [400, 800].map((w) => `${base}?w=${w}&fm=avif ${w}w`).join(', '), width: size, height: size };
}

function photoView(photo: Photo): OwnPhotoView {
  return {
    id: photo.id,
    caption: photo.caption,
    fileName: photo.fileName ?? null,
    state: photo.processing ? 'Processing' : 'Ready',
    image: photo.processing ? null : rendition(photo, 160),
  };
}

function certificateView(c: Caterer): CertificateView | null {
  const cert = c.certificate;
  if (!cert) return null;
  return {
    holder: cert.holder,
    issuer: cert.issuer,
    number: cert.number,
    expires: cert.expires,
    savedAt: cert.savedAt ?? c.createdAt,
    file: cert.fileName ? { name: cert.fileName, size: cert.fileSize ?? 0, type: cert.fileType ?? 'PDF', uploadedAt: cert.fileUploadedAt ?? cert.savedAt ?? c.createdAt } : null,
  };
}

function checklist(store: Store, c: Caterer, owner: User | undefined): ChecklistItemView[] {
  const today = torontoDate(store.now);
  const description = length(c.description);
  const done: Record<ChecklistKey, boolean> = {
    email: !!owner?.emailVerified,
    name: length(c.name) >= 2 && length(c.name) <= 80,
    description: description >= 50 && description <= 2000,
    cuisines: c.cuisines.length >= 1 && c.cuisines.length <= 5,
    areas: c.areas.length >= 1,
    guests: c.minGuests >= 1 && c.maxGuests >= c.minGuests,
    occasions: c.occasions.length >= 1,
    photos: c.photos.length >= MIN_PUBLISHED && c.photos.length <= MAX_PHOTOS && c.photos.every((p) => length(p.caption) >= 5),
    menu: c.dishes.length >= MIN_PUBLISHED && c.dishes.length <= MAX_DISHES,
    certificate: !!c.certificate && c.certificate.expires >= today,
  };
  return CHECKLIST_ORDER.map((key) => ({ key, done: done[key] }));
}

function ownerOf(store: Store, c: Caterer): User | undefined {
  return store.users.find((u) => u.catererId === c.id && !u.deleted);
}

function profileView(store: Store, c: Caterer): OwnProfileView {
  const owner = ownerOf(store, c);
  settleProcessing(store, c);
  const cover = c.photos[0] && !c.photos[0].processing ? { alt: c.photos[0].caption, image: rendition(c.photos[0], 280) } : null;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    status: c.status,
    statusChangedAt: c.statusChangedAt ?? null,
    statusReason: c.statusReason ?? null,
    publishedAt: c.status === 'Published' ? (c.publishedAt ?? null) : null,
    pendingName: c.pendingName ? { name: c.pendingName, requestedAt: c.pendingNameAt ?? store.now.toISOString() } : null,
    contactName: owner?.displayName ?? '',
    email: owner?.email ?? '',
    emailVerified: !!owner?.emailVerified,
    description: c.description,
    cuisines: c.cuisines,
    primaryCuisine: c.cuisines[0] ?? null,
    areas: c.areas,
    primaryArea: c.areas[0] ?? null,
    minGuests: c.minGuests >= 1 ? c.minGuests : null,
    maxGuests: c.maxGuests >= 1 ? c.maxGuests : null,
    occasions: c.occasions,
    photos: c.photos.map(photoView),
    dishes: c.dishes.map((d) => ({ id: d.id, name: d.name, description: d.description ?? null, tags: d.tags as DietaryTagId[], price: d.price ?? null })),
    certificate: certificateView(c),
    checklist: checklist(store, c, owner),
    attention: (c.attention ?? []) as AttentionView[],
    cover,
  };
}

/** Processing finishes as soon as the image service is up again (L2-091.2). */
function settleProcessing(store: Store, c: Caterer): void {
  if (extra(store).processingDown) return;
  for (const p of c.photos) if (p.processing) p.processing = false;
}

// ---------------------------------------------------------------------------
// Access: the session's own caterer profile, never one named in the request (L2-079)
// ---------------------------------------------------------------------------

type Own = { user: User; caterer: Caterer };

function own(ctx: Ctx<Store>): Own | Reply {
  const user = currentUser(ctx.store, ctx.cookies);
  if (!user) return unauthorized();
  if (user.role !== 'Caterer') return forbidden();
  const caterer = ctx.store.caterers.find((c) => c.id === user.catererId);
  if (!caterer) return notFound();
  return { user, caterer };
}

const isReply = (x: Own | Reply): x is Reply => 'status' in x && !('caterer' in x);

/** Draft and Changes requested are edited freely, Published edits go live; nothing else changes (set-up-profile design). */
function editable(c: Caterer): Reply | null {
  if (c.status === 'Draft' || c.status === 'Changes requested' || c.status === 'Published') return null;
  return conflict('Your profile can’t be changed right now', { status: c.status });
}

function handle(fn: (o: Own, ctx: Ctx<Store>) => Reply): (ctx: Ctx<Store>) => Reply {
  return (ctx) => {
    const o = own(ctx);
    return isReply(o) ? o : fn(o, ctx);
  };
}

// ---------------------------------------------------------------------------
// Uploads: the type comes from the content signature, never the name (L2-041.3)
// ---------------------------------------------------------------------------

type Sniffed = 'JPEG' | 'PNG' | 'WEBP' | 'HEIC' | 'PDF' | null;

function sniff(bytes: Buffer): Sniffed {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'JPEG';
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'PNG';
  if (bytes.length >= 12 && bytes.toString('latin1', 0, 4) === 'RIFF' && bytes.toString('latin1', 8, 12) === 'WEBP') return 'WEBP';
  if (bytes.length >= 12 && bytes.toString('latin1', 4, 8) === 'ftyp' && /^(heic|heix|mif1|msf1|hevc)$/.test(bytes.toString('latin1', 8, 12))) return 'HEIC';
  if (bytes.length >= 5 && bytes.toString('latin1', 0, 5) === '%PDF-') return 'PDF';
  return null;
}

/** Width and height from a PNG header or a JPEG start-of-frame marker; null when unknown. */
function dimensions(bytes: Buffer, type: Sniffed): { width: number; height: number } | null {
  if (type === 'PNG' && bytes.length >= 24) return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (type === 'JPEG') {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) return null;
      const marker = bytes[i + 1];
      const size = bytes.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: bytes.readUInt16BE(i + 5), width: bytes.readUInt16BE(i + 7) };
      }
      i += 2 + size;
    }
  }
  return null;
}

function decode(body: unknown): { fileName: string; bytes: Buffer } | null {
  const b = body as { fileName?: unknown; data?: unknown } | undefined;
  if (!b || typeof b.data !== 'string' || typeof b.fileName !== 'string') return null;
  return { fileName: b.fileName, bytes: Buffer.from(b.data, 'base64') };
}

function checkPhoto(body: unknown): { fileName: string } | Reply {
  const file = decode(body);
  if (!file) return invalid({ file: [PHOTO_TYPE] });
  if (file.bytes.length > PHOTO_BYTES) return invalid({ file: [PHOTO_SIZE] });
  const type = sniff(file.bytes);
  if (!type || type === 'PDF') return invalid({ file: [PHOTO_TYPE] });
  const size = dimensions(file.bytes, type);
  if (size && Math.min(size.width, size.height) < 800) return invalid({ file: [PHOTO_SIZE] });
  return { fileName: file.fileName };
}

// ---------------------------------------------------------------------------
// Section rules (set-up-profile and edit-published-profile designs)
// ---------------------------------------------------------------------------

const WHOLE = /^\d+$/;

function guestsError(raw: unknown): string | null {
  const v = typeof raw === 'number' ? String(raw) : text(raw);
  if (!WHOLE.test(v)) return 'Enter a whole number from 1 to 5,000';
  const n = Number(v);
  return n >= 1 && n <= 5000 ? null : 'Enter a whole number from 1 to 5,000';
}

function saveDetails(store: Store, c: Caterer, body: any): Reply | null {
  const errors: Record<string, string[]> = {};
  const name = text(body?.name);
  const description = text(body?.description);
  if (name.length < 2 || name.length > 80) errors['name'] = ['Enter a business name of 2 to 80 characters'];
  if (description.length > 2000) errors['description'] = ['Write no more than 2,000 characters'];
  else if (c.status === 'Published' && description.length < 50) errors['description'] = ['Write at least 50 characters'];
  if (Object.keys(errors).length) return invalid(errors);
  c.description = description;
  if (c.status === 'Published') {
    // A new public name needs an operator's approval; the old one stays live (L2-044.2).
    if (name === c.name) {
      delete c.pendingName;
      delete c.pendingNameAt;
    } else if (name !== c.pendingName) {
      c.pendingName = name;
      c.pendingNameAt = store.now.toISOString();
    }
  } else {
    c.name = name;
  }
  return null;
}

function saveCuisines(store: Store, c: Caterer, body: any): Reply | null {
  const cuisines: unknown[] = Array.isArray(body?.cuisines) ? body.cuisines : [];
  const areas: unknown[] = Array.isArray(body?.areas) ? body.areas : [];
  const known = new Set(store.cuisines.filter((x) => !x.retired || c.cuisines.includes(x.id)).map((x) => x.id));
  const allAreas = new Set(store.regions.flatMap((r) => r.areas.map((a) => a.id)));
  if (cuisines.some((x) => typeof x !== 'string' || !known.has(x)) || areas.some((x) => typeof x !== 'string' || !allAreas.has(x))) {
    return { status: 400, body: { title: 'Unknown cuisine or area' } };
  }
  const errors: Record<string, string[]> = {};
  if (cuisines.length < 1 || cuisines.length > 5) errors['cuisines'] = ['Choose between 1 and 5 cuisines'];
  else if (typeof body?.primaryCuisine !== 'string' || !cuisines.includes(body.primaryCuisine)) errors['primaryCuisine'] = ['Mark one cuisine as primary'];
  if (areas.length < 1) errors['areas'] = ['Choose at least one area you serve'];
  else if (typeof body?.primaryArea !== 'string' || !areas.includes(body.primaryArea)) errors['primaryArea'] = ['Choose your primary area'];
  if (Object.keys(errors).length) return invalid(errors);
  const unique = <T,>(xs: T[]) => [...new Set(xs)];
  c.cuisines = unique([body.primaryCuisine as string, ...(cuisines as string[])]);
  c.areas = unique([body.primaryArea as string, ...(areas as string[])]);
  return null;
}

function saveEvents(c: Caterer, body: any): Reply | null {
  const occasions: unknown[] = Array.isArray(body?.occasions) ? body.occasions : [];
  const known = new Set(OCCASIONS.map((o) => o.id));
  // A value off the fixed list is a bad request and nothing is stored (L2-021.3).
  if (occasions.some((o) => typeof o !== 'string' || !known.has(o))) return { status: 400, body: { title: 'Unknown occasion' } };
  const errors: Record<string, string[]> = {};
  const minError = guestsError(body?.minGuests);
  const maxError = guestsError(body?.maxGuests);
  if (minError) errors['minGuests'] = [minError];
  if (maxError) errors['maxGuests'] = [maxError];
  if (!minError && !maxError && Number(text(String(body.minGuests))) > Number(text(String(body.maxGuests)))) {
    errors['minGuests'] = ['Minimum guests can’t be more than maximum guests'];
  }
  if (!occasions.length) errors['occasions'] = ['Choose at least one occasion'];
  if (Object.keys(errors).length) return invalid(errors);
  c.minGuests = Number(text(String(body.minGuests)));
  c.maxGuests = Number(text(String(body.maxGuests)));
  c.occasions = OCCASIONS.map((o) => o.id).filter((id) => occasions.includes(id));
  return null;
}

function dishErrors(body: any): Record<string, string[]> | Reply {
  const errors: Record<string, string[]> = {};
  const tags: unknown[] = Array.isArray(body?.tags) ? body.tags : [];
  // Tags come only from the fixed list (L2-017.3); anything else is a bad request.
  if (tags.some((t) => typeof t !== 'string' || !DIETARY.includes(t as DietaryTagId))) return { status: 400, body: { title: 'Unknown dietary tag' } };
  const name = length(body?.name);
  if (name < 2 || name > 80) errors['name'] = ['Dish names are 2–80 characters'];
  if (length(body?.description) > 300) errors['description'] = ['Keep the description to 300 characters'];
  if (length(body?.price) > 60) errors['price'] = ['Keep price guidance to 60 characters'];
  return errors;
}

function dishFrom(body: any, id: string): Dish {
  const description = text(body.description);
  const price = text(body.price);
  return {
    id,
    name: text(body.name),
    tags: DIETARY.filter((t) => (body.tags as string[]).includes(t)),
    ...(description ? { description } : {}),
    ...(price ? { price } : {}),
  };
}

function reorder<T extends { id: string }>(items: T[], ids: unknown): T[] | null {
  if (!Array.isArray(ids) || ids.length !== items.length) return null;
  const out = ids.map((id) => items.find((x) => x.id === id));
  return out.every(Boolean) && new Set(ids).size === ids.length ? (out as T[]) : null;
}

// ---------------------------------------------------------------------------
// Reviews of the caterer's own business (respond-to-review design)
// ---------------------------------------------------------------------------

const REVIEW_PAGE = 10;

function ownReviewView(r: Store['reviews'][number]): OwnReviewView {
  return {
    id: r.id,
    author: reviewerLabel(r.authorName),
    eventMonth: r.eventDate.slice(0, 7),
    postedAt: r.createdAt,
    rating: r.rating,
    text: r.text,
    response: r.response ? { text: r.response.text, createdAt: r.response.createdAt } : null,
  };
}

/** The review if it is one of the caller's, 403 if it is another caterer's, 404 if it does not exist (L2-052.3). */
function reviewFor(ctx: Ctx<Store>, o: Own): Store['reviews'][number] | Reply {
  const review = ctx.store.reviews.find((r) => r.id === ctx.params['id'] && r.status === 'Published');
  if (!review) return notFound();
  if (review.catererId !== o.caterer.id) return forbidden();
  if (o.caterer.status === 'Suspended' || o.caterer.status === 'Removed') return conflict('Your profile can’t be changed right now');
  return review;
}

function responseText(body: any): string | Reply {
  const t = text(body?.text);
  if (t.length < 1 || t.length > 1000) return invalid({ text: ['Write a response, up to 1,000 characters'] });
  return t;
}

const isReview = (x: Store['reviews'][number] | Reply): x is Store['reviews'][number] => 'catererId' in x;

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** Fake endpoints of the caterer-profile area. */
export function registerCatererProfile(r: Router<Store>): void {
  r.get('/api/caterer/profile', handle(({ caterer }, ctx) => ok(profileView(ctx.store, caterer))));

  r.get(
    '/api/caterer/profile/reference-data',
    handle(({ caterer }, ctx) => {
      const view: ReferenceDataView = {
        cuisines: ctx.store.cuisines
          .filter((x) => !x.retired || caterer.cuisines.includes(x.id))
          .map(({ id, name }) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name, 'en-CA')),
        regions: ctx.store.regions.map((rg) => ({ id: rg.id, name: rg.name, areas: rg.areas.map((a) => ({ ...a })) })),
        occasions: OCCASIONS.map((o) => ({ ...o })),
      };
      return ok(view);
    }),
  );

  r.put(
    '/api/caterer/profile/sections/:section',
    handle(({ caterer }, ctx) => {
      const blocked = editable(caterer);
      if (blocked) return blocked;
      const section = ctx.params['section'];
      const refused =
        section === 'details' ? saveDetails(ctx.store, caterer, ctx.body) : section === 'cuisines' ? saveCuisines(ctx.store, caterer, ctx.body) : section === 'events' ? saveEvents(caterer, ctx.body) : notFound();
      return refused ?? ok(profileView(ctx.store, caterer));
    }),
  );

  // Photos (manage-photos design)
  r.post(
    '/api/caterer/profile/photos',
    handle(({ caterer }, ctx) => {
      const blocked = editable(caterer);
      if (blocked) return blocked;
      if (caterer.photos.length >= MAX_PHOTOS) return conflict('You can have up to 30 photos');
      const checked = checkPhoto(ctx.body);
      if ('status' in checked) return checked;
      const e = extra(ctx.store);
      const file = UPLOAD_FILES[e.uploads++ % UPLOAD_FILES.length];
      const photo: Photo = { id: `photo-${newId()}`, file: `${file}.jpg`, caption: '', fileName: checked.fileName, processing: e.processingDown };
      caterer.photos.push(photo);
      return ok(photoView(photo), 201);
    }),
  );

  r.put(
    '/api/caterer/profile/photos/order',
    handle(({ caterer }, ctx) => {
      const blocked = editable(caterer);
      if (blocked) return blocked;
      const next = reorder(caterer.photos, ctx.body?.photoIds);
      if (!next) return { status: 400, body: { title: 'Send every photo id once' } };
      caterer.photos = next;
      return ok(profileView(ctx.store, caterer));
    }),
  );

  r.post(
    '/api/caterer/profile/photos/:id/replacement',
    handle(({ caterer }, ctx) => {
      const blocked = editable(caterer);
      if (blocked) return blocked;
      const photo = caterer.photos.find((p) => p.id === ctx.params['id']);
      if (!photo) return notFound();
      const checked = checkPhoto(ctx.body);
      if ('status' in checked) return checked;
      const e = extra(ctx.store);
      // The new image takes the old one's place and caption (L2-042.2).
      photo.file = `${UPLOAD_FILES[e.uploads++ % UPLOAD_FILES.length]}.jpg`;
      photo.fileName = checked.fileName;
      photo.processing = e.processingDown;
      return ok(photoView(photo));
    }),
  );

  r.patch(
    '/api/caterer/profile/photos/:id',
    handle(({ caterer }, ctx) => {
      const blocked = editable(caterer);
      if (blocked) return blocked;
      const index = caterer.photos.findIndex((p) => p.id === ctx.params['id']);
      if (index < 0) return notFound();
      const caption = text(ctx.body?.caption);
      if (caption.length < 5 || caption.length > 125) return invalid({ caption: ['Captions describe the photo in 5–125 characters'] });
      const [photo] = caterer.photos.splice(index, 1);
      photo.caption = caption;
      // The cover is always photo 1 (L2-042.6).
      if (ctx.body?.useAsCover === true) caterer.photos.unshift(photo);
      else caterer.photos.splice(index, 0, photo);
      return ok(profileView(ctx.store, caterer));
    }),
  );

  r.delete(
    '/api/caterer/profile/photos/:id',
    handle(({ caterer }, ctx) => {
      const blocked = editable(caterer);
      if (blocked) return blocked;
      const index = caterer.photos.findIndex((p) => p.id === ctx.params['id']);
      if (index < 0) return notFound();
      if (caterer.status === 'Published' && caterer.photos.length <= MIN_PUBLISHED) return conflict('Published profiles need at least 3 photos');
      const [photo] = caterer.photos.splice(index, 1);
      extra(ctx.store).trash.set(photo.id, { photo, index });
      return ok(profileView(ctx.store, caterer));
    }),
  );

  r.post(
    '/api/caterer/profile/photos/:id/restoration',
    handle(({ caterer }, ctx) => {
      const trash = extra(ctx.store).trash;
      const removed = trash.get(ctx.params['id']);
      if (!removed) return notFound();
      if (caterer.photos.length >= MAX_PHOTOS) return conflict('You can have up to 30 photos');
      trash.delete(ctx.params['id']);
      caterer.photos.splice(Math.min(removed.index, caterer.photos.length), 0, removed.photo);
      return ok(profileView(ctx.store, caterer));
    }),
  );

  // Menu (manage-menu design)
  r.post(
    '/api/caterer/profile/menu-items',
    handle(({ caterer }, ctx) => {
      const blocked = editable(caterer);
      if (blocked) return blocked;
      if (caterer.dishes.length >= MAX_DISHES) return conflict('You can list up to 50 dishes');
      const errors = dishErrors(ctx.body);
      if ('status' in errors) return errors as Reply;
      if (Object.keys(errors).length) return invalid(errors as Record<string, string[]>);
      caterer.dishes.push(dishFrom(ctx.body, `dish-${newId()}`));
      return ok(profileView(ctx.store, caterer), 201);
    }),
  );

  r.put(
    '/api/caterer/profile/menu-items/order',
    handle(({ caterer }, ctx) => {
      const blocked = editable(caterer);
      if (blocked) return blocked;
      const next = reorder(caterer.dishes, ctx.body?.dishIds);
      if (!next) return { status: 400, body: { title: 'Send every dish id once' } };
      caterer.dishes = next;
      return ok(profileView(ctx.store, caterer));
    }),
  );

  r.put(
    '/api/caterer/profile/menu-items/:id',
    handle(({ caterer }, ctx) => {
      const blocked = editable(caterer);
      if (blocked) return blocked;
      const index = caterer.dishes.findIndex((d) => d.id === ctx.params['id']);
      if (index < 0) return notFound();
      const errors = dishErrors(ctx.body);
      if ('status' in errors) return errors as Reply;
      if (Object.keys(errors).length) return invalid(errors as Record<string, string[]>);
      caterer.dishes[index] = dishFrom(ctx.body, caterer.dishes[index].id);
      return ok(profileView(ctx.store, caterer));
    }),
  );

  r.delete(
    '/api/caterer/profile/menu-items/:id',
    handle(({ caterer }, ctx) => {
      const blocked = editable(caterer);
      if (blocked) return blocked;
      const index = caterer.dishes.findIndex((d) => d.id === ctx.params['id']);
      if (index < 0) return notFound();
      if (caterer.status === 'Published' && caterer.dishes.length <= MIN_PUBLISHED) return conflict('Published profiles need at least 3 dishes');
      caterer.dishes.splice(index, 1);
      return ok(profileView(ctx.store, caterer));
    }),
  );

  // Food handler certificate (provide-food-handler-certificate design): editable while suspended too.
  const certificateBlocked = (c: Caterer): Reply | null =>
    c.status === 'Pending review' || c.status === 'Removed' ? conflict('Your profile can’t be changed right now', { status: c.status }) : null;

  r.put(
    '/api/caterer/profile/certificate',
    handle(({ caterer }, ctx) => {
      const blocked = certificateBlocked(caterer);
      if (blocked) return blocked;
      const b = ctx.body ?? {};
      const errors: Record<string, string[]> = {};
      if (!length(b.holder)) errors['holder'] = ['Enter the name on the certificate'];
      if (!length(b.issuer)) errors['issuer'] = ['Enter who issued the certificate'];
      if (!length(b.number)) errors['number'] = ['Enter the certificate number'];
      const expires = text(b.expires);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(expires)) errors['expires'] = ['Enter the expiry date'];
      else if (expires < torontoDate(ctx.store.now)) errors['expires'] = ['This certificate has expired'];
      if (Object.keys(errors).length) return invalid(errors);
      caterer.certificate = {
        ...(caterer.certificate ?? {}),
        holder: text(b.holder),
        issuer: text(b.issuer),
        number: text(b.number).toUpperCase(),
        expires,
        savedAt: ctx.store.now.toISOString(),
      };
      return ok(certificateView(caterer));
    }),
  );

  r.post(
    '/api/caterer/profile/certificate/file',
    handle(({ caterer }, ctx) => {
      const blocked = certificateBlocked(caterer);
      if (blocked) return blocked;
      if (!caterer.certificate) return conflict('Save the certificate details first');
      const file = decode(ctx.body);
      const type = file ? sniff(file.bytes) : null;
      if (!file || !type || type === 'WEBP' || type === 'HEIC') return invalid({ file: ['This file isn’t a PDF, JPEG or PNG, so nothing was saved'] });
      if (file.bytes.length > CERTIFICATE_BYTES) return invalid({ file: ['Certificate copies must be a PDF, JPEG or PNG of up to 10 MB'] });
      Object.assign(caterer.certificate, { fileName: file.fileName, fileSize: file.bytes.length, fileType: type, fileUploadedAt: ctx.store.now.toISOString() });
      return ok(certificateView(caterer), 201);
    }),
  );

  r.delete(
    '/api/caterer/profile/certificate/file',
    handle(({ caterer }) => {
      const blocked = certificateBlocked(caterer);
      if (blocked) return blocked;
      if (!caterer.certificate?.fileName) return notFound();
      delete caterer.certificate.fileName;
      delete caterer.certificate.fileSize;
      delete caterer.certificate.fileType;
      delete caterer.certificate.fileUploadedAt;
      return ok(certificateView(caterer));
    }),
  );

  // Submission (submit-profile-for-review design)
  r.post(
    '/api/caterer/profile/submission',
    handle(({ caterer }, ctx) => {
      if (caterer.status !== 'Draft' && caterer.status !== 'Changes requested') return conflict('Only a draft can be submitted', { status: caterer.status });
      const view = profileView(ctx.store, caterer);
      const failed = view.checklist.filter((i) => !i.done);
      if (failed.length) {
        const problem: SubmissionProblem = {
          title: 'Your profile isn’t ready yet',
          failed: failed.map((i) => ({ key: i.key, detail: i.key === 'photos' ? `you have ${caterer.photos.length}` : i.key === 'menu' ? `you have ${caterer.dishes.length}` : null })),
        };
        return { status: 422, body: problem };
      }
      caterer.status = 'Pending review';
      caterer.statusChangedAt = ctx.store.now.toISOString();
      delete caterer.attention;
      delete caterer.statusReason;
      return ok(profileView(ctx.store, caterer));
    }),
  );

  r.delete(
    '/api/caterer/profile/submission',
    handle(({ caterer }, ctx) => {
      if (caterer.status !== 'Pending review') return conflict('Only a profile waiting for review can be withdrawn', { status: caterer.status });
      caterer.status = 'Draft';
      caterer.statusChangedAt = ctx.store.now.toISOString();
      return ok(profileView(ctx.store, caterer));
    }),
  );

  // Reviews and responses (respond-to-review design)
  r.get(
    '/api/caterer/reviews',
    handle(({ caterer }, ctx) => {
      const published = ctx.store.reviews.filter((x) => x.catererId === caterer.id && x.status === 'Published').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const pageCount = Math.max(1, Math.ceil(published.length / REVIEW_PAGE));
      const page = Math.min(Math.max(1, Number(ctx.query.get('page')) || 1), pageCount);
      const view: OwnReviewPageView = {
        items: published.slice((page - 1) * REVIEW_PAGE, page * REVIEW_PAGE).map(ownReviewView),
        page,
        pageCount,
        total: published.length,
        average: published.length ? published.reduce((s, x) => s + x.rating, 0) / published.length : 0,
        unanswered: published.filter((x) => !x.response).length,
      };
      return ok(view);
    }),
  );

  r.post(
    '/api/caterer/reviews/:id/response',
    handle((o, ctx) => {
      const review = reviewFor(ctx, o);
      if (!isReview(review)) return review;
      if (review.response) return conflict('This review already has your response', { response: ownReviewView(review).response });
      const t = responseText(ctx.body);
      if (typeof t !== 'string') return t;
      review.response = { text: t, createdAt: ctx.store.now.toISOString() };
      // The reviewer hears about it (L2-052.4).
      const reviewer = ctx.store.users.find((u) => u.id === review.authorUserId && !u.deleted);
      if (reviewer) sendEmail(ctx.store, reviewer.email, 'review-response');
      return ok(ownReviewView(review), 201);
    }),
  );

  r.put(
    '/api/caterer/reviews/:id/response',
    handle((o, ctx) => {
      const review = reviewFor(ctx, o);
      if (!isReview(review)) return review;
      if (!review.response) return notFound();
      const t = responseText(ctx.body);
      if (typeof t !== 'string') return t;
      review.response = { ...review.response, text: t };
      return ok(ownReviewView(review));
    }),
  );

  r.delete(
    '/api/caterer/reviews/:id/response',
    handle((o, ctx) => {
      const review = reviewFor(ctx, o);
      if (!isReview(review)) return review;
      if (!review.response) return notFound();
      delete review.response;
      return ok(ownReviewView(review));
    }),
  );
}

// ---------------------------------------------------------------------------
// Scenarios (`backend.scenario(name, args)`)
// ---------------------------------------------------------------------------

const BEV_ID = 'cat-bev';
const BEV_DESCRIPTION =
  'Beverley Campbell has cooked Sunday dinner for half of her Oshawa street for twenty years: curry goat, rice and peas, escovitch fish and festival, made the way her mother made them in Linstead.\n\nShe caters christenings, nine-nights and family reunions of up to 150 people across Durham.';
const BEV_PHOTOS: [string, string][] = [
  ['green-fig-catering', 'Curry goat and rice in my steel pot'],
  ['brown-stew-kitchen', 'Brown stew chicken, seen from above'],
  ['bammy-bros', 'Curry chicken with white rice'],
  ['fungee-and-pepperpot', 'Escovitch chicken with peppers over rice'],
  ['lambie-lane', 'Christmas black cake with a raspberry on top'],
];
const BEV_DISHES: Omit<Dish, 'id'>[] = [
  { name: 'Curry goat', description: 'Bone-in, with potato and pimento.', tags: ['gluten-free', 'halal', 'spicy'], price: 'From $19 per person' },
  { name: 'Brown stew chicken', tags: ['gluten-free'], price: 'From $15 per person' },
  { name: 'Rice and peas', description: 'Kidney beans, coconut milk, thyme.', tags: ['vegan', 'gluten-free'] },
  { name: 'Festival', tags: ['vegetarian'], price: '$2 each' },
  { name: 'Escovitch fish', description: 'Fried snapper under pickled peppers and onion.', tags: ['gluten-free', 'dairy-free', 'spicy'] },
];

type BevState = 'new' | 'draft' | 'ready' | 'pending' | 'changes-requested' | 'published';

/** Beverley Campbell's Auntie Bev's Kitchen at each step of setup (docs/mocks/pages/dashboard). */
function beverley(store: Store, state: BevState): void {
  let user = store.users.find((u) => u.email === 'beverley@auntiebevs.example');
  if (!user) {
    user = {
      id: 'user-beverley',
      role: 'Caterer',
      displayName: 'Beverley Campbell',
      email: 'beverley@auntiebevs.example',
      phone: '+1 905 555 0164',
      password: 'pepperpot-sunday-2026',
      passwordChangedAt: '2026-10-01T14:00:00Z',
      emailVerified: true,
      catererId: BEV_ID,
      createdAt: '2026-10-01T14:00:00Z',
      acceptedPrivacyVersion: '2026-03',
      acceptedPrivacyAt: '2026-10-01T14:00:00Z',
    };
    store.users.push(user);
  }
  user.emailVerified = state !== 'new';
  store.caterers = store.caterers.filter((c) => c.id !== BEV_ID);
  const complete = state !== 'new' && state !== 'draft';
  const caterer: Caterer = {
    id: BEV_ID,
    slug: 'auntie-bevs-kitchen',
    name: 'Auntie Bev’s Kitchen',
    status: 'Draft',
    ownerUserId: user.id,
    cuisines: state === 'new' ? [] : ['jamaican'],
    areas: state === 'new' ? [] : ['oshawa', 'ajax', 'clarington', 'pickering', 'whitby'],
    minGuests: state === 'new' ? 0 : 10,
    maxGuests: state === 'new' ? 0 : 150,
    occasions: state === 'new' ? [] : ['birthdays', 'funerals-and-repasts', 'religious-and-cultural-celebrations', 'family-gatherings'],
    description: state === 'new' ? '' : BEV_DESCRIPTION,
    photos: (state === 'new' ? [] : BEV_PHOTOS.slice(0, complete ? 5 : 2)).map(([file, caption], i) => ({ id: `bev-photo-${i + 1}`, file: `${file}.jpg`, caption })),
    dishes: state === 'new' ? [] : BEV_DISHES.map((d, i) => ({ ...d, id: `bev-dish-${i + 1}` })),
    ...(complete
      ? { certificate: { holder: 'Beverley Campbell', issuer: 'Durham Region Health Department', number: 'FH-2025-204517', expires: '2030-01-22', savedAt: '2026-10-05T14:00:00Z' } }
      : {}),
    createdAt: '2026-10-01T14:00:00Z',
    previousSlugs: [],
  };
  if (state === 'pending') Object.assign(caterer, { status: 'Pending review', statusChangedAt: '2026-10-07T15:00:00Z' });
  if (state === 'changes-requested') {
    Object.assign(caterer, {
      status: 'Changes requested',
      statusChangedAt: '2026-10-09T15:00:00Z',
      statusReason: 'Photos 2 and 5 look like stock images. Please upload photos of your own food.',
      attention: [{ key: 'photos', note: 'Replace photos 2 and 5' }],
    });
  }
  if (state === 'published') Object.assign(caterer, { status: 'Published', statusChangedAt: store.now.toISOString(), publishedAt: store.now.toISOString() });
  store.caterers.push(caterer);
}

/** Named store changes tests can ask for (`backend.scenario(name, args)`). */
export const catererProfileScenarios: Record<string, (store: Store, args: any) => unknown> = {
  beverley: (store, { state }: { state: BevState }) => beverley(store, state),

  /** Sharon Best's Flying Fish Kitchen, suspended on Thu 8 Oct for its expired certificate (L2-044.4). */
  'flying-fish-suspended': (store) => {
    const c = store.caterers.find((x) => x.slug === 'flying-fish-kitchen')!;
    Object.assign(c, {
      status: 'Suspended',
      statusChangedAt: '2026-10-08T14:00:00Z',
      statusReason: 'Your food handler certificate expired on 30 Sep 2026. Upload a current certificate and we’ll review it within 3 business days.',
      cuisines: ['barbadian-bajan'],
      areas: ['oshawa', 'ajax', 'whitby', 'clarington'],
      minGuests: 15,
      maxGuests: 200,
      description:
        'Sharon Best brings Bridgetown to Durham: flying fish and cou-cou, macaroni pie, fish cakes with Bajan pepper sauce, and conkies every November.\n\nSmall weddings, church anniversaries and office lunches from 15 to 200 guests.',
    });
  },

  /** Kendra asked on Fri 9 Oct to rename Pelau House (L2-044.2). */
  'pelau-name-change-pending': (store) => {
    const c = store.caterers.find((x) => x.slug === 'pelau-house')!;
    Object.assign(c, { pendingName: 'Pelau House by Kendra', pendingNameAt: '2026-10-09T15:30:00Z' });
  },

  /** The image service is down: uploads are kept and stay "Processing" (L2-091.2). */
  'image-processing-down': (store) => {
    extra(store).processingDown = true;
  },

  /** An operator added a cuisine to the list (L2-007.4). */
  'cuisine-added': (store, { name }: { name: string }) => {
    store.cuisines.push({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, retired: false, addedAt: store.now.toISOString() });
  },

  /** The caterer responded to a review from another tab or device (L2-052.2). */
  'review-responded': (store, { reviewId, text: t }: { reviewId: string; text: string }) => {
    const review = store.reviews.find((r) => r.id === reviewId)!;
    review.response = { text: t, createdAt: store.now.toISOString() };
  },

  /** The image service is back: processing photos finish on the next read. */
  'image-processing-recovers': (store) => {
    extra(store).processingDown = false;
  },
};

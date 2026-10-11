import type { Caterer, Photo } from '../caterers/model.ts';
import type { User } from '../identity/model.ts';
import { torontoDate } from '../discovery/listing.ts';
import type { CertificateView } from '@contract/certificate-view.ts';
import type { ChecklistItemView } from '@contract/checklist-item-view.ts';
import type { ChecklistKey } from '@contract/checklist-key.ts';
import type { DietaryTagId } from '@contract/dietary-tag-id.ts';
import type { OwnPhotoView } from '@contract/own-photo-view.ts';
import type { OwnProfileView } from '@contract/own-profile-view.ts';
import type { AttentionView } from '@contract/attention-view.ts';
import type { PhotoRendition } from '@contract/photo-rendition.ts';

/** Limits of L2-039, L2-042 and L2-043. */
export const MAX_PHOTOS = 30;
export const MIN_PUBLISHED = 3;
export const MAX_DISHES = 50;

const CHECKLIST_ORDER: ChecklistKey[] = ['email', 'name', 'description', 'cuisines', 'areas', 'guests', 'occasions', 'photos', 'menu', 'certificate'];

export function rendition(photo: Photo, size: number): PhotoRendition {
  const base = `/media/${photo.file}`;
  return { src: `${base}?w=400&fm=jpeg`, srcset: [400, 800].map((w) => `${base}?w=${w}&fm=avif ${w}w`).join(', '), width: size, height: size };
}

export function photoView(photo: Photo): OwnPhotoView {
  return {
    id: photo.id,
    caption: photo.caption,
    fileName: photo.fileName ?? null,
    state: photo.processing ? 'Processing' : 'Ready',
    image: photo.processing ? null : rendition(photo, 160),
  };
}

export function certificateView(c: Caterer): CertificateView | null {
  const cert = c.certificate;
  if (!cert) return null;
  return {
    holder: cert.holder,
    issuer: cert.issuer,
    number: cert.number,
    expires: cert.expires,
    savedAt: cert.savedAt ?? c.createdAt,
    file: cert.fileName
      ? { name: cert.fileName, size: cert.fileSize ?? 0, type: cert.fileType ?? 'PDF', uploadedAt: cert.fileUploadedAt ?? cert.savedAt ?? c.createdAt }
      : null,
  };
}

const length = (s: string | undefined) => (s ?? '').trim().length;

/** Each submission rule of L2-039, done or not. */
export function checklist(c: Caterer, owner: User | undefined, now: Date): ChecklistItemView[] {
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
    certificate: !!c.certificate && c.certificate.expires >= torontoDate(now),
  };
  return CHECKLIST_ORDER.map((key) => ({ key, done: done[key] }));
}

/** The profile as its owner's editor shows it. */
export function profileView(c: Caterer, owner: User | undefined, now: Date): OwnProfileView {
  const first = c.photos[0];
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    status: c.status,
    statusChangedAt: c.statusChangedAt ?? null,
    statusReason: c.statusReason ?? null,
    publishedAt: c.status === 'Published' ? (c.publishedAt ?? null) : null,
    pendingName: c.pendingName ? { name: c.pendingName, requestedAt: c.pendingNameAt ?? now.toISOString() } : null,
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
    checklist: checklist(c, owner, now),
    attention: (c.attention ?? []) as AttentionView[],
    cover: first && !first.processing ? { alt: first.caption, image: rendition(first, 280) } : null,
  };
}

import type { Document, Transaction } from '../platform/database.ts';

export type ProfileStatus = 'Draft' | 'Pending review' | 'Changes requested' | 'Published' | 'Suspended' | 'Removed';

export interface Photo {
  id: string;
  /** Media id; seeded photos use the mock image's file name. */
  file: string;
  caption: string;
  processing?: boolean;
  /** The name an uploaded photo arrived with (manage-photos design). */
  fileName?: string;
  /** A replacement waiting for the image service; `file` stays on the page until it is ready (L2-042.2). */
  pendingFile?: string;
  pendingFileName?: string;
}

export interface Dish {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  price?: string;
}

export interface Certificate {
  holder: string;
  issuer: string;
  number: string;
  expires: string;
  fileName?: string;
  fileSize?: number;
  /** Media id of the uploaded copy; never public. */
  fileMediaId?: string;
  savedAt?: string;
  fileUploadedAt?: string;
  fileType?: 'PDF' | 'JPEG' | 'PNG';
}

/** A caterer's profile: the aggregate behind the listing, the caterer page and the dashboard. */
export interface Caterer extends Document {
  slug: string;
  name: string;
  status: ProfileStatus;
  ownerUserId?: string;
  /** Cuisine ids; the first is primary. */
  cuisines: string[];
  /** Service area ids; the first is primary. */
  areas: string[];
  minGuests: number;
  maxGuests: number;
  occasions: string[];
  description: string;
  photos: Photo[];
  dishes: Dish[];
  certificate?: Certificate;
  businessEmail?: string;
  businessPhone?: string;
  createdAt: string;
  publishedAt?: string;
  /** Old slugs that redirect (L2-018.3). */
  previousSlugs: string[];
  statusReason?: string;
  pendingName?: string;
  /** When the status last changed (submitted, changes requested, suspended, removed). */
  statusChangedAt?: string;
  /** When the pending business name was asked for (L2-044.2). */
  pendingNameAt?: string;
  /** Sections an operator flagged when asking for changes (L2-048.3). */
  /** `replaceBy` marks an operator's replacement deadline (L2-057.2); it clears once the minimum is met again. */
  attention?: { key: string; note: string; replaceBy?: string }[];
}

export const caterers = (tx: Transaction) => tx.collection<Caterer>('caterers');

/** "Pimento & Thyme" → "pimento-and-thyme"; "Auntie Bev’s Kitchen" → "auntie-bevs-kitchen". */
export function slugify(name: string): string {
  return name
    .replace(/[’']/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * A free address for `name` (SlugService, L2-018.2): `-2`, `-3`, … when another
 * caterer uses it or keeps it as a redirect. `self` may take back its own old
 * addresses.
 */
export async function uniqueSlug(tx: Transaction, name: string, self?: string): Promise<string> {
  const base = slugify(name) || 'caterer';
  const taken = new Set((await caterers(tx).all()).filter((c) => c.id !== self).flatMap((c) => [c.slug, ...c.previousSlugs]));
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

/**
 * The caterer under a new name: a free address, the old one kept as a
 * redirect, and the new one never left among its own redirects (L2-018.3).
 */
export async function withAddressFor(tx: Transaction, c: Caterer, name: string): Promise<Pick<Caterer, 'slug' | 'previousSlugs'>> {
  const slug = await uniqueSlug(tx, name, c.id);
  if (slug === c.slug) return { slug, previousSlugs: c.previousSlugs };
  return { slug, previousSlugs: [...c.previousSlugs.filter((s) => s !== slug), c.slug] };
}

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
  attention?: { key: string; note: string }[];
}

export const caterers = (tx: Transaction) => tx.collection<Caterer>('caterers');

/** "Pimento & Thyme" → "pimento-and-thyme". */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

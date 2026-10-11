import type { ProfileStatus } from './caterers.ts';
import type { Photo } from './photo.ts';
import type { Dish } from './dish.ts';
import type { Certificate } from './certificate.ts';

export interface Caterer {
  id: string;
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

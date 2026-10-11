/**
 * Wire types for the caterer's own profile: dashboard, profile editor, photos,
 * menu, certificate, submission and review responses (ADR 0003,
 * docs/detailed-designs/caterer-profiles, reviews/respond-to-review).
 * Shared with the fake backend; keep import-free.
 */

export type OwnProfileStatus = 'Draft' | 'Pending review' | 'Changes requested' | 'Published' | 'Suspended' | 'Removed';

/** The L2-039 submission rules, in checklist order. */
export type ChecklistKey = 'email' | 'name' | 'description' | 'cuisines' | 'areas' | 'guests' | 'occasions' | 'photos' | 'menu' | 'certificate';

export interface ChecklistItemView {
  key: ChecklistKey;
  done: boolean;
}

/** A section an operator flagged when asking for changes, with what to do ("Replace photos 2 and 5"). */
export interface AttentionView {
  key: ChecklistKey;
  note: string;
}

export interface PhotoRendition {
  /** The 160 px rendition for tiles, or the 280 px one for the card. */
  src: string;
  srcset: string;
  width: number;
  height: number;
}

export interface OwnPhotoView {
  id: string;
  /** Empty until the caterer writes one (L2-042.3). */
  caption: string;
  /** The name the file was uploaded with, for photos still processing. */
  fileName: string | null;
  /** `Processing` while the image service works on it (L2-041, L2-091.2). */
  state: 'Ready' | 'Processing';
  /** Null while processing. */
  image: PhotoRendition | null;
}

export type DietaryTagId = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'halal' | 'contains-nuts' | 'contains-shellfish' | 'spicy';

export interface OwnDishView {
  id: string;
  name: string;
  description: string | null;
  tags: DietaryTagId[];
  price: string | null;
}

export interface DishRequest {
  name: string;
  description: string;
  tags: DietaryTagId[];
  price: string;
}

export interface CertificateFileView {
  name: string;
  /** Bytes. */
  size: number;
  type: 'PDF' | 'JPEG' | 'PNG';
  uploadedAt: string;
}

export interface CertificateView {
  holder: string;
  issuer: string;
  number: string;
  /** YYYY-MM-DD. */
  expires: string;
  savedAt: string;
  file: CertificateFileView | null;
}

export interface CertificateRequest {
  holder: string;
  issuer: string;
  number: string;
  expires: string;
}

/** A file sent as base64; the server checks its content, not its name (L2-041.3). */
export interface UploadRequest {
  fileName: string;
  /** Base64 of the file's bytes. */
  data: string;
}

/** The signed-in caterer's own profile as the editor sees it (set-up-profile design). */
export interface OwnProfileView {
  id: string;
  /** The public name; a pending change waits in `pendingName` (L2-044.2). */
  name: string;
  slug: string;
  status: OwnProfileStatus;
  /** When the status last changed: submitted, changes requested, suspended or removed. */
  statusChangedAt: string | null;
  /** The operator's words for changes requested, suspension or removal. */
  statusReason: string | null;
  /** When the profile was last approved (Published only). */
  publishedAt: string | null;
  pendingName: { name: string; requestedAt: string } | null;
  contactName: string;
  email: string;
  emailVerified: boolean;
  description: string;
  /** Cuisine ids; `primaryCuisine` is one of them. */
  cuisines: string[];
  primaryCuisine: string | null;
  /** Service area ids; `primaryArea` is one of them. */
  areas: string[];
  primaryArea: string | null;
  minGuests: number | null;
  maxGuests: number | null;
  /** Occasion ids. */
  occasions: string[];
  photos: OwnPhotoView[];
  dishes: OwnDishView[];
  certificate: CertificateView | null;
  checklist: ChecklistItemView[];
  attention: AttentionView[];
  /** The listing card's photo: the cover (photo 1), when ready. */
  cover: { alt: string; image: PhotoRendition } | null;
}

export interface ReferenceDataView {
  /** Active cuisines in alphabetical order, plus retired ones this caterer still holds. */
  cuisines: { id: string; name: string }[];
  regions: { id: string; name: string; areas: { id: string; name: string }[] }[];
  occasions: { id: string; name: string }[];
}

export interface DetailsRequest {
  name: string;
  description: string;
}

export interface CuisinesRequest {
  cuisines: string[];
  primaryCuisine: string | null;
  areas: string[];
  primaryArea: string | null;
}

export interface EventsRequest {
  /** As typed, so the server can name a non-numeric entry (L2-020.4). */
  minGuests: string;
  maxGuests: string;
  occasions: string[];
}

export type SectionRequest = { section: 'details'; values: DetailsRequest } | { section: 'cuisines'; values: CuisinesRequest } | { section: 'events'; values: EventsRequest };

/** HTTP 422 from a refused submission: every rule that failed (L2-039.3). */
export interface SubmissionProblem {
  title: string;
  failed: { key: ChecklistKey; detail: string | null }[];
}

/** One review of the caterer's business, for responding (respond-to-review design). */
export interface OwnReviewView {
  id: string;
  /** "Andre C." */
  author: string;
  /** YYYY-MM. */
  eventMonth: string;
  postedAt: string;
  rating: number;
  text: string;
  response: { text: string; createdAt: string } | null;
}

export interface OwnReviewPageView {
  items: OwnReviewView[];
  page: number;
  pageCount: number;
  total: number;
  /** Average of published reviews; 0 when there are none. */
  average: number;
  /** Reviews that have no response yet. */
  unanswered: number;
}

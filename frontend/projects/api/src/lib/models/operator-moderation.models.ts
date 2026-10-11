/**
 * Wire types of operator moderation (ADR 0003): the review queue, profile
 * review, caterer records, recent changes and reports
 * (docs/detailed-designs/moderation). Shared with the fake backend; keep import-free.
 */

export type ProfileStatus = 'Draft' | 'Pending review' | 'Changes requested' | 'Published' | 'Suspended' | 'Removed';

export type ReportReason = 'Inaccurate information' | 'Inappropriate content' | 'Fake or spam' | 'Food safety concern' | 'Other';

/** Why the reviews subsystem held a review back (L2-050.3). */
export type HoldReason = 'phone' | 'email' | 'link';

// ---------------------------------------------------------------------------
// Review queue (work-review-queue design, L2-047)
// ---------------------------------------------------------------------------

export type QueueItemKind = 'profile' | 'resubmitted' | 'name-change' | 'certificate' | 'reports' | 'held-review';

/** The queue's filter as it appears in the URL (`?kind=reports`). */
export type QueueFilter = 'profiles' | 'name-changes' | 'certificates' | 'reports';

interface QueueItemBase {
  /** Stable for the life of the item ("profile:cat-910"). */
  id: string;
  /** The caterer id, or the first report's id for a report group, or the review id. */
  targetId: string;
  title: string;
  /** The caterer's cover at 400 px, when there is one. */
  photo: string | null;
  /** Submission, name-change request, expiry detection, first open report or hold time (ISO, UTC). */
  waitingSince: string;
  /** Waiting 3 days or more: the domain's rule (queue-item CRD D-3). */
  late: boolean;
}

export type QueueItemView =
  | (QueueItemBase & { kind: 'profile' | 'resubmitted'; cuisine: string; area: string })
  | (QueueItemBase & { kind: 'name-change'; newName: string; status: ProfileStatus })
  | (QueueItemBase & { kind: 'certificate'; expired: string; status: ProfileStatus })
  | (QueueItemBase & { kind: 'reports'; count: number; reasons: ReportReason[]; hidden: boolean })
  | (QueueItemBase & { kind: 'held-review'; holdReason: HoldReason });

export interface QueueCounts {
  all: number;
  profiles: number;
  nameChanges: number;
  certificates: number;
  reports: number;
  heldReviews: number;
}

export interface QueuePageView {
  /** Oldest first. */
  items: QueueItemView[];
  /** Items that match the filter. */
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  /** Items of each kind, ignoring the filter. */
  counts: QueueCounts;
  /** Late items, ignoring the filter. */
  late: number;
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

export interface ReviewCertificateView {
  holder: string;
  issuer: string;
  number: string;
  /** YYYY-MM-DD. */
  expires: string;
  expired: boolean;
  fileName: string | null;
  fileSize: number | null;
}

export interface OwnerView {
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  /** The first time the profile was published, else when the account was created. */
  since: string;
}

/** One status change (L2-046.4); never edited afterwards. */
export interface StatusChangeView {
  at: string;
  status: ProfileStatus;
  /** Who made it, by full name. */
  by: string;
  /** What kind of step it was, for the note under it. */
  step: 'created' | 'submitted' | 'resubmitted' | 'approved' | 'changes-requested' | 'suspended' | 'reinstated' | 'removed';
  /** The operator's words, exactly as sent to the caterer. */
  reason: string | null;
}

// ---------------------------------------------------------------------------
// Profile review (work-review-queue + decide-profile-approval designs)
// ---------------------------------------------------------------------------

export interface ReviewPhotoView {
  id: string;
  src: string;
  caption: string;
  cover: boolean;
  /** Added since the last "Changes requested" decision (L2-047.3). */
  isNew: boolean;
}

export interface ReviewDishView {
  name: string;
  description: string | null;
  price: string | null;
  tags: string[];
}

/** How the profile will appear publicly (L2-047.2): the public fields only. */
export interface PublicProfileView {
  name: string;
  cuisines: string[];
  /** Paragraphs, as written. */
  description: string[];
  /** Paragraphs the resubmission removed (L2-047.3). */
  removedParagraphs: string[];
  minGuests: number;
  maxGuests: number;
  occasions: string[];
  photos: ReviewPhotoView[];
  dishes: ReviewDishView[];
  regions: { name: string; areas: string[] }[];
}

export interface SubmissionChecks {
  emailVerified: boolean;
  photos: number;
  photosComplete: boolean;
  dishes: number;
  detailsComplete: boolean;
  certificateValid: boolean;
}

export interface ReviewHistoryView {
  at: string;
  step: 'created' | 'submitted' | 'resubmitted' | 'changes-requested' | 'published' | 'name-change-requested';
  by: string | null;
  reason: string | null;
}

export interface SubmissionReviewView {
  kind: 'submission';
  id: string;
  name: string;
  status: ProfileStatus;
  cover: string | null;
  submittedAt: string;
  resubmitted: boolean;
  /** The decision the caterer answered, for a resubmission. */
  changesRequested: { by: string; at: string; reason: string } | null;
  /** How many fields changed since that decision. */
  changedFields: number;
  descriptionChanged: boolean;
  profile: PublicProfileView;
  contact: OwnerView;
  certificate: ReviewCertificateView | null;
  checks: SubmissionChecks;
  history: ReviewHistoryView[];
}

export interface NameChangeReviewView {
  kind: 'name-change';
  id: string;
  name: string;
  newName: string;
  status: ProfileStatus;
  slug: string;
  newSlug: string;
  requestedAt: string;
  requestedBy: string;
  owner: string;
  card: { photo: string; alt: string; cuisine: string; area: string };
  history: ReviewHistoryView[];
}

export type ProfileReviewView = SubmissionReviewView | NameChangeReviewView;

export interface DecisionResult {
  id: string;
  name: string;
  slug: string;
  status: ProfileStatus;
  owner: string;
}

export interface ReasonRequest {
  reason: string;
}

// ---------------------------------------------------------------------------
// Caterer records (suspend-reinstate-remove-profile, edit-profile-as-operator)
// ---------------------------------------------------------------------------

export type CatererStatusFilter = 'draft' | 'pending' | 'changes' | 'published' | 'suspended' | 'removed';

export type CatererFlag = 'name-change' | 'open-reports' | 'resubmitted' | 'certificate-expired';

export interface CatererRowView {
  id: string;
  name: string;
  status: ProfileStatus;
  photo: string | null;
  cuisine: string;
  area: string;
  owner: string;
  updatedAt: string;
  flag: CatererFlag | null;
  openReports: number;
}

export interface CatererCounts {
  all: number;
  draft: number;
  pending: number;
  changes: number;
  published: number;
  suspended: number;
  removed: number;
}

export interface CaterersPageView {
  /** Most recently changed first. */
  items: CatererRowView[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  /** Caterers in each status, ignoring the filters. */
  counts: CatererCounts;
  /** With a search and a status that match nothing: the first caterer the search finds in another status. */
  otherMatch: { name: string; status: ProfileStatus } | null;
}

export interface CatererRecordView {
  id: string;
  name: string;
  slug: string;
  status: ProfileStatus;
  photo: string | null;
  pendingName: string | null;
  owner: OwnerView;
  profile: {
    photos: { id: string; src: string; alt: string }[];
    /** Primary first. */
    cuisines: string[];
    /** Primary first. */
    areas: string[];
    minGuests: number;
    maxGuests: number;
    occasions: string[];
    dishes: { id: string; name: string }[];
    description: string;
  };
  certificate: ReviewCertificateView | null;
  /** When the expiry reminders went out (L2-040.2). */
  certificateReminders: string[];
  activity: { enquiries: number; openEnquiries: number; rating: { average: number; count: number }; openReports: number };
  /** Newest first. */
  history: StatusChangeView[];
  /** Set while suspended. */
  suspension: { at: string; closedEnquiries: number } | null;
  /** Set once removed. */
  removal: { at: string } | null;
}

export type EditableField = 'name' | 'description' | 'cuisines' | 'areas' | 'guests' | 'occasions';

export interface OperatorEditRequest {
  field: EditableField;
  /** Text for name and description; names for lists; `{ min, max }` for guests. */
  value: string | string[] | { min: number; max: number };
  reason: string;
}

export interface RemoveItemResult {
  /** The profile is below the minimums and the caterer has 14 days to replace it (L2-057.2). */
  replaceBy: string | null;
}

// ---------------------------------------------------------------------------
// Recent changes (L2-047.4, L2-057.3)
// ---------------------------------------------------------------------------

export type ChangedField = 'description' | 'guests' | 'menu' | 'cover-photo' | 'areas' | 'occasions';

export type ChangeValue =
  | { kind: 'text'; text: string }
  | { kind: 'guests'; min: number; max: number }
  | { kind: 'list'; items: string[] }
  | { kind: 'dish'; name: string; price: string | null; tags: string[] }
  | { kind: 'photo'; src: string; alt: string };

export interface RecentChangeView {
  id: string;
  catererId: string;
  catererName: string;
  photo: string | null;
  field: ChangedField;
  by: string;
  at: string;
  /** `null`: there was nothing before (a new dish). */
  old: ChangeValue | null;
  new: ChangeValue | null;
  reverted: { by: string; at: string } | null;
}

export interface RecentChangesPageView {
  /** Newest first, from the last 30 days. */
  items: RecentChangeView[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

// ---------------------------------------------------------------------------
// Reports (handle-reports design, L2-055, L2-034.3–4)
// ---------------------------------------------------------------------------

export interface ReportEntryView {
  reason: ReportReason;
  details: string | null;
  at: string;
  /** Whether a signed-in customer sent it; reporters are never named (L2-054.5). */
  signedIn: boolean;
}

export type ReportedTargetView =
  | {
      kind: 'Review';
      reviewId: string;
      caterer: { name: string; photo: string | null };
      author: string;
      rating: number;
      text: string;
      eventDate: string;
      status: 'Published' | 'Held' | 'Hidden' | 'Removed';
      /** Why a hidden review is hidden. */
      hiddenBy: 'reports' | 'operator' | null;
      hiddenAt: string | null;
    }
  | {
      kind: 'CatererProfile';
      catererId: string;
      name: string;
      photo: string | null;
      cuisine: string;
      area: string;
      owner: string;
      status: ProfileStatus;
      certificate: ReviewCertificateView | null;
    };

export type ReportOutcome = 'dismissed' | 'hidden' | 'review-removed' | 'suspended' | 'removed';

export interface ReportGroupView {
  /** The first report's id ("R-2041"). */
  id: string;
  status: 'Open' | 'Resolved';
  since: string;
  target: ReportedTargetView;
  reports: ReportEntryView[];
  linkedEnquiry: { customer: string; caterer: string; eventDate: string; guests: number; status: string } | null;
  resolution: { at: string; by: string; outcome: ReportOutcome; note: string; auditId: string; reporterEmailed: boolean } | null;
}

export type ResolveAction = 'hide' | 'remove-review' | 'suspend' | 'remove';

export interface ResolveReportRequest {
  decision: 'dismiss' | 'action';
  action?: ResolveAction;
  note: string;
}

/** A read-only enquiry opened while handling a report (L2-034.3). */
export interface ReportEnquiryView {
  customer: string;
  caterer: string;
  eventDate: string;
  guests: number;
  status: string;
  message: string;
  sentAt: string;
  entries: { id: string; from: 'customer' | 'caterer'; text: string; at: string }[];
}

/**
 * Wire types of the operator console's settings and moderation screens:
 * cuisine list, breach register, operator accounts, audit log and review
 * moderation (ADR 0003). Shared with the fake backend; keep import-free.
 */

/** One entry of the cuisine catalogue as operators see it (manage-cuisine-list). */
export interface OperatorCuisine {
  id: string;
  name: string;
  retired: boolean;
  /** UTC. */
  addedAt: string;
  /** Display name of the operator who added it; absent for the launch list. */
  addedBy?: string | null;
  retiredAt?: string | null;
  /** Published caterers that list this cuisine. */
  publishedCaterers: number;
}

export interface AddCuisineRequest {
  name: string;
}

/** A published caterer that uses a cuisine (L2-007.5). */
export interface CuisineUser {
  name: string;
  slug: string;
  photo: string;
}

export interface CuisineUsage {
  cuisine: OperatorCuisine;
  caterers: CuisineUser[];
}

/** One record of the breach register (L2-075.2). */
export interface BreachRecord {
  id: string;
  title: string;
  /** YYYY-MM-DD, the day the breach was confirmed. */
  confirmedOn: string;
  recordedAt: string;
  recordedBy: string;
  information: string;
  peopleAffected: number;
  riskAssessment: string;
  notificationDecision: string;
}

export type BreachInformation = 'Names' | 'Email addresses' | 'Phone numbers' | 'Event details' | 'Messages' | 'Food handler certificates';

export interface RecordBreachRequest {
  date: string;
  what: string;
  information: BreachInformation[];
  /** Whole number as typed; the server rejects anything else. */
  people: string;
  risk: 'low' | 'real' | null;
  riskNotes: string;
  decision: 'report' | 'not' | null;
}

/** An operator account (manage-operator-accounts). */
export interface OperatorAccount {
  id: string;
  name: string;
  initials: string;
  email: string;
  admin: boolean;
  secondFactor: 'authenticator app' | 'security key' | null;
  status: 'Active' | 'Invited' | 'Deactivated';
  /** UTC; absent when never signed in. */
  lastActiveAt?: string | null;
  invitedAt?: string | null;
  deactivatedAt?: string | null;
  /** The signed-in operator's own row. */
  self: boolean;
}

export interface AddOperatorRequest {
  name: string;
  email: string;
  role: 'operator' | 'admin';
}

/** 403 body from Admin-only endpoints: who to ask instead (L2-056.5). */
export interface AdminOnlyProblem {
  title: string;
  admins: string[];
}

/** One audit entry as stored (query-audit-log): append-only. */
export interface AuditEntry {
  id: string;
  /** UTC. */
  at: string;
  operatorId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  before: string | null;
  after: string | null;
}

/** An audit entry with the names an Admin reads. */
export interface AuditEntryView extends AuditEntry {
  operatorName: string;
  targetLabel: string;
}

export interface AuditPage {
  entries: AuditEntryView[];
  total: number;
  page: number;
  pageSize: number;
  /** False only while the log holds no entries at all. */
  anyEntries: boolean;
  operators: { id: string; name: string }[];
}

export interface AuditQuery {
  operator?: string;
  /** Comma-separated action keys. */
  action?: string;
  target?: string;
  from?: string;
  to?: string;
  page?: number;
}

export type ModerationStatus = 'Held' | 'Hidden';

/** A held or hidden review on the operator Reviews screen (moderate-reviews). */
export interface ModeratedReview {
  id: string;
  status: ModerationStatus;
  catererName: string;
  catererSlug: string;
  catererPhoto: string;
  /** "Priya R." */
  reviewer: string;
  rating: number;
  text: string;
  /** YYYY-MM-DD */
  eventDate: string;
  /** Held reviews: what the check matched, and where. */
  held?: { reason: 'phone' | 'link' | 'email'; ranges: { start: number; end: number }[] } | null;
  /** Hidden reviews: who hid it and why; `by` is null when hidden automatically after reports. */
  hidden?: { by: string | null; reports: number; reason: string } | null;
  /** When it was held or hidden, UTC. */
  at: string;
}

export interface ModerationList {
  held: number;
  hidden: number;
  reviews: ModeratedReview[];
}

export type ModerationAction = 'approve' | 'hide' | 'restore' | 'remove';

export interface ModerateReviewRequest {
  reason: string;
}

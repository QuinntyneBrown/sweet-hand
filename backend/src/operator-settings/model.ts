import type { Document, Transaction } from '../platform/database.ts';
import type { BreachRecord } from '@contract/breach-record.ts';

/** One record of the breach register (L2-075.2): kept for at least 24 months, never edited. */
export interface Breach extends Document, BreachRecord {
  /** The operator who recorded it; `recordedBy` keeps their name as it was then. */
  recordedById: string;
}

/** An operator invited by an Admin who has not set up their account yet (L2-056). */
export interface OperatorInvitation extends Document {
  name: string;
  email: string;
  emailKey: string;
  admin: boolean;
  invitedAt: string;
  invitedBy: string;
  /** SHA-256 of the single-use link token; the token itself is only in the email. */
  tokenHash: string;
  expiresAt: string;
  deactivatedAt?: string;
  /** The authenticator secret offered during enrolment, until the invitation is accepted. */
  pendingTotpSecret?: string;
  /** When the invitation was used, and the account it created. */
  acceptedAt?: string;
  userId?: string;
}

/** When an Admin deactivated an operator account, keyed by the operator's user id (L2-056.4). */
export interface OperatorDeactivation extends Document {
  at: string;
  by: string;
}

/** Last activity of an operator from before the current sessions (sessions hold the rest), keyed by user id. */
export interface OperatorActivity extends Document {
  lastActiveAt: string;
}

/**
 * One day's aggregates (view-metrics-dashboard: DailyMetric), keyed by the
 * Toronto date YYYY-MM-DD. Visits recorded since the day was aggregated are
 * added from the `visits` collection.
 */
export interface DailyMetrics extends Document {
  listing: number;
  caterer: number;
  unique: number;
  enquiries: number;
  /** Enquiries created that day that had a caterer reply within 48 hours. */
  replied: number;
  /** Caterers first published that day. */
  published: number;
}

/** What the aggregation last worked out for today: when counting began and caterers by status, Published first. */
export interface MetricsState extends Document {
  countingSince: string;
  statuses: { status: string; count: number }[];
}

export const METRICS_STATE_ID = 'current';

export type PageType = 'Listing' | 'CatererPage';

/** One counted page load (L2-062.2): exactly the daily hash, page type, caterer (if any) and time. */
export interface VisitRecord extends Document {
  dailyHash: string;
  pageType: PageType;
  catererId?: string;
  occurredAt: string;
}

/** The random salt for one Toronto day, keyed by that date; deleted once the day is over (L2-062.4). */
export interface VisitSalt extends Document {
  salt: string;
}

export const breaches =(tx: Transaction) => tx.collection<Breach>('breaches');
export const operatorInvitations = (tx: Transaction) => tx.collection<OperatorInvitation>('operatorInvitations');
export const operatorDeactivations = (tx: Transaction) => tx.collection<OperatorDeactivation>('operatorDeactivations');
export const operatorActivity = (tx: Transaction) => tx.collection<OperatorActivity>('operatorActivity');
export const dailyMetrics = (tx: Transaction) => tx.collection<DailyMetrics>('dailyMetrics');
export const metricsState = (tx: Transaction) => tx.collection<MetricsState>('metricsState');
export const visits = (tx: Transaction) => tx.collection<VisitRecord>('visits');
export const visitSalts = (tx: Transaction) => tx.collection<VisitSalt>('visitSalts');

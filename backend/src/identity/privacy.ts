import { randomUUID } from 'node:crypto';
import type { Document, Transaction } from '../platform/database.ts';
import type { User } from './model.ts';

/** A published privacy notice version (L2-070). */
export interface PrivacyNoticeVersion extends Document {
  version: string;
  effectiveDate: string;
  /** Substantially different purposes: existing users accept again at their next sign-in (L2-070.4). */
  substantialChange: boolean;
  changes: string[];
}

export const PRIVACY_NOTICE_ID = 'privacy-notice';

export const settings = (tx: Transaction) => tx.collection<PrivacyNoticeVersion>('settings');

export async function currentPrivacyNotice(tx: Transaction): Promise<PrivacyNoticeVersion> {
  return (
    (await settings(tx).get(PRIVACY_NOTICE_ID)) ?? { id: PRIVACY_NOTICE_ID, version: '2026-03', effectiveDate: '2026-03-01', substantialChange: false, changes: [] }
  );
}

/** A newer notice with substantially different purposes is accepted at the next sign-in (L2-070.4). */
export async function privacyUpdateRequired(tx: Transaction, user: User): Promise<boolean> {
  const notice = await currentPrivacyNotice(tx);
  return notice.substantialChange && user.acceptedPrivacyVersion !== notice.version;
}

/** Publishes a new notice version (the privacy officer's change; also used by the test-control API). */
export async function publishPrivacyNotice(tx: Transaction, notice: Omit<PrivacyNoticeVersion, 'id'>): Promise<void> {
  await settings(tx).put({ id: PRIVACY_NOTICE_ID, ...notice });
}

/** One acceptance of a notice version; records are only ever added (ConsentRecord, L2-070.3). */
export interface ConsentRecord extends Document {
  userId: string;
  noticeVersion: string;
  /** Caterers also accept the caterer terms, recorded with the notice (register-caterer design). */
  termsVersion?: string;
  acceptedAt: string;
}

/** The caterer terms in force; a new version is a content change (`<TO SUPPLY>` wording). */
export const CATERER_TERMS_VERSION = '2026-03';

export const consents = (tx: Transaction) => tx.collection<ConsentRecord>('consents');

/** Adds a consent record, in the same unit of work as the change that needs it. */
export async function recordConsent(tx: Transaction, userId: string, noticeVersion: string, now: Date, termsVersion?: string): Promise<void> {
  await consents(tx).put({ id: `consent-${randomUUID()}`, userId, noticeVersion, ...(termsVersion ? { termsVersion } : {}), acceptedAt: now.toISOString() });
}

/** An account's consent records, oldest first; accounts from before records were kept show their recorded acceptance. */
export async function consentsOf(tx: Transaction, user: User): Promise<{ noticeVersion: string; termsVersion?: string; acceptedAt: string }[]> {
  const records = (await consents(tx).find({ userId: user.id })).sort((a, b) => a.acceptedAt.localeCompare(b.acceptedAt));
  if (records.length) return records.map(({ noticeVersion, termsVersion, acceptedAt }) => ({ noticeVersion, ...(termsVersion ? { termsVersion } : {}), acceptedAt }));
  return user.acceptedPrivacyVersion ? [{ noticeVersion: user.acceptedPrivacyVersion, acceptedAt: user.acceptedPrivacyAt }] : [];
}

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

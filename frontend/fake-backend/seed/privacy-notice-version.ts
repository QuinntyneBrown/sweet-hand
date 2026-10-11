/** A published privacy notice version (L2-070). */
export interface PrivacyNoticeVersion {
  version: string;
  effectiveDate: string;
  /** Substantially different purposes: existing users accept again at their next sign-in (L2-070.4). */
  substantialChange: boolean;
  changes: string[];
}

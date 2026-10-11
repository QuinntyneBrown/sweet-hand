/** The current published privacy notice version (L2-070). */
export interface PrivacyNotice {
  version: string;
  /** YYYY-MM-DD, the day the version takes effect. */
  effectiveDate: string;
  /** What is different from the previous version, in the privacy officer's words. */
  changes: string[];
}

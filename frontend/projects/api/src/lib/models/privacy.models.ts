/** Wire types for the privacy notice and consent (ADR 0003). Shared with the fake backend; keep import-free. */

/** The current published privacy notice version (L2-070). */
export interface PrivacyNotice {
  version: string;
  /** YYYY-MM-DD, the day the version takes effect. */
  effectiveDate: string;
  /** What is different from the previous version, in the privacy officer's words. */
  changes: string[];
}

/** Acceptance of the notice the person was shown (L2-070.3). */
export interface ConsentRequest {
  version: string;
}

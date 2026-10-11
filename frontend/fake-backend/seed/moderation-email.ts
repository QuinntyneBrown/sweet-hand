/** An email the platform would have sent; tests read these instead of a mailbox. */
export interface ModerationEmail {
  to: string;
  kind: string;
  at: string;
  reason?: string;
  link?: string;
  /** When a removed photo or dish must be replaced by (L2-057.2), YYYY-MM-DD. */
  replaceBy?: string;
}

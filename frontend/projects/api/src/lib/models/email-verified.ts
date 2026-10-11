/** What a verification link confirms (L2-077.3). 410 when the link has expired or was used. */
export interface EmailVerified {
  displayName: string;
  /** An enquiry the customer saved before verifying (L2-023.3). */
  savedEnquiry: { catererName: string; catererSlug: string; photo: string; eventDate: string; guests: number } | null;
}

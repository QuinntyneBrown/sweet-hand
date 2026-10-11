/** An enquiry a customer filled in before verifying their email (L2-023.3); the enquiries area owns the real drafts. */
export interface SavedEnquiry {
  userId: string;
  catererSlug: string;
  eventDate: string;
  guests: number;
}

/**
 * A replied enquiry whose event has passed: what makes a customer eligible to
 * review (L2-049). The enquiries area owns enquiries; until its seed carries
 * events, the reviews fake reads these.
 */
export interface ReviewableEvent {
  userId: string;
  catererId: string;
  enquiryId: string;
  eventDate: string;
  replied: boolean;
}

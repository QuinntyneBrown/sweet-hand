/** What the enquiry form holds, as typed; also the shape of a saved draft (L2-023.1). */
export interface EnquiryFormValues {
  /** YYYY-MM-DD, or '' when not chosen. */
  eventDate: string;
  /** As typed, so "fifty" survives a round trip and is reported (L2-022.4). */
  guests: string;
  /** Service area id (L2-010). */
  area: string;
  postalCode: string;
  /** Occasion id (L2-021). */
  occasion: string;
  message: string;
}

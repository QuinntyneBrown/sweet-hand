/** The caterer an enquiry is for: what the form shows and checks fit against (L2-024, L2-026.2). */
export interface EnquiryTarget {
  slug: string;
  name: string;
  /** The cover photo shown at the top of the form. */
  photo: string;
  /** The caterer's guest range. */
  minGuests: number;
  maxGuests: number;
  /** Names of the service areas the caterer lists. */
  areas: string[];
}

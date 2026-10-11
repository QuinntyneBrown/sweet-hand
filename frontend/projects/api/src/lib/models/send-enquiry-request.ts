import type { EnquiryFormValues } from './enquiry-form-values';

/** `POST /api/enquiries`. The server checks every field again (L2-022.6). */
export interface SendEnquiryRequest extends EnquiryFormValues {
  catererSlug: string;
  /** Bot protection (L2-025.4, L2-082.2). */
  challengeToken: string;
}

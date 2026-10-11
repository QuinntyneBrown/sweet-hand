import type { EnquiryFormValues } from './enquiry-form-values';

/** `GET /api/enquiries/drafts/:caterer`: the signed-in customer's unsent values, kept for 24 hours (L2-023.3). */
export interface EnquiryDraftView {
  values: EnquiryFormValues;
  savedAt: string;
}

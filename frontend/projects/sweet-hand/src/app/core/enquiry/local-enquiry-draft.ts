import type { EnquiryFormValues } from '@sweet-hand/api';

/** A visitor's unsent enquiry, kept while they sign in or register (send-enquiry design, `EnquiryDraftStore`). */
export interface LocalEnquiryDraft {
  caterer: { slug: string; name: string; photo: string };
  values: EnquiryFormValues;
  savedAt: number;
}

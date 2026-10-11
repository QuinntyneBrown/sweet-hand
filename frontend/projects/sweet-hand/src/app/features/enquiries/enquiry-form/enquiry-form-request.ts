import type { EnquiryTarget } from '../../../core/enquiry/enquiry-target';
import type { EnquiryFormValues } from '@sweet-hand/api';

/** What the launcher opens the form with. */
export interface EnquiryFormRequest {
  caterer: EnquiryTarget;
  /** The "Send an enquiry" button, for focus to return to (L2-067.4). */
  trigger: HTMLElement | null;
  /** Values typed before signing in (L2-023.1). */
  restored?: EnquiryFormValues | null;
}

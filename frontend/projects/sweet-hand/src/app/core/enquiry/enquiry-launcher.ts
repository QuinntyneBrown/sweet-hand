import type { EnquiryTarget } from './enquiry-target';



/** The query parameter that reopens the form after signing in (L2-013.3). */
export const RESUME_PARAM = 'enquiry';
export const RESUME_VALUE = 'resume';

/**
 * Starts an enquiry from a "Send an enquiry" button (L2-013.3, L2-015.4).
 * Pages depend on this contract; the enquiries area provides the form
 * (features/enquiries/providers.ts). `trigger` is the button, so the form can
 * return focus to it (L2-067.4).
 */
export abstract class EnquiryLauncher {
  abstract open(caterer: EnquiryTarget, trigger: HTMLElement | null): void;

  /**
   * Called by the caterer page once it has loaded: when the visitor was sent
   * to sign in from the form, reopens it with what they typed (L2-023.1).
   */
  abstract resume(caterer: EnquiryTarget, trigger: HTMLElement | null): void;
}

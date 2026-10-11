import type { Provider } from '@angular/core';
import { EnquiryLauncher } from '../../core/enquiry/enquiry-launcher';
import { DialogEnquiryLauncher } from './enquiry-form/dialog-enquiry-launcher';
import { ENQUIRIES_SERVICE, EnquiriesService } from '@sweet-hand/api';

/** API contracts of the enquiries area (ADR 0003), and the enquiry form behind every "Send an enquiry". */
export const enquiriesProviders: Provider[] = [
  { provide: ENQUIRIES_SERVICE, useClass: EnquiriesService },
  { provide: EnquiryLauncher, useExisting: DialogEnquiryLauncher },
];

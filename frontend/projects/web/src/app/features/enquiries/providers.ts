import type { Provider } from '@angular/core';
import { EnquiriesApi, HttpEnquiriesApi } from '../../core/api/enquiries-api';
import { EnquiryLauncher } from '../../core/enquiry/enquiry-launcher';
import { DialogEnquiryLauncher } from './enquiry-form/dialog-enquiry-launcher';

/** API contracts of the enquiries area (ADR 0003), and the enquiry form behind every "Send an enquiry". */
export const enquiriesProviders: Provider[] = [
  { provide: EnquiriesApi, useClass: HttpEnquiriesApi },
  { provide: EnquiryLauncher, useExisting: DialogEnquiryLauncher },
];

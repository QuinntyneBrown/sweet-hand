import type { Provider } from '@angular/core';
import { EnquiriesApi, HttpEnquiriesApi } from '../../core/api/enquiries-api';

/** API contracts of the enquiries area (ADR 0003). */
export const enquiriesProviders: Provider[] = [{ provide: EnquiriesApi, useClass: HttpEnquiriesApi }];

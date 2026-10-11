import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { SiteNotice } from '../models/notices.models';

/** Site-wide notices shown in the banner under the header (docs/mocks/notifications/site-banner). */
export interface INoticesService {
  current(): Observable<SiteNotice[]>;
}

export const NOTICES_SERVICE = new InjectionToken<INoticesService>('NOTICES_SERVICE');

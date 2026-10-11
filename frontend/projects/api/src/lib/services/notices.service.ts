import type { Observable } from 'rxjs';
import type { SiteNotice } from '../models/notices.models';

/** Site-wide notices shown in the banner under the header (docs/mocks/notifications/site-banner). */
export abstract class NoticesService {
  abstract current(): Observable<SiteNotice[]>;
}

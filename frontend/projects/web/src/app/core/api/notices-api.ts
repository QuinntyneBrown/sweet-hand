import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { SiteNotice } from './notices.models';

/** Site-wide notices shown in the banner under the header (docs/mocks/notifications/site-banner). */
export abstract class NoticesApi {
  abstract current(): Observable<SiteNotice[]>;
}

@Injectable()
export class HttpNoticesApi extends NoticesApi {
  private readonly http = inject(HttpClient);

  current(): Observable<SiteNotice[]> {
    return this.http.get<SiteNotice[]>('/api/public/notices');
  }
}

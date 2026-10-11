import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { PrivacyNotice } from './privacy.models';

/** The privacy notice and consent records (consent-to-privacy-notice design, `PrivacyClient`). */
export abstract class PrivacyApi {
  abstract currentNotice(): Observable<PrivacyNotice>;
  /** Records that the signed-in account accepted `version` (L2-070.3). */
  abstract accept(version: string): Observable<void>;
}

@Injectable()
export class HttpPrivacyApi extends PrivacyApi {
  private readonly http = inject(HttpClient);

  currentNotice(): Observable<PrivacyNotice> {
    return this.http.get<PrivacyNotice>('/api/public/privacy-notice');
  }

  accept(version: string): Observable<void> {
    return this.http.post<void>('/api/me/consents', { version });
  }
}

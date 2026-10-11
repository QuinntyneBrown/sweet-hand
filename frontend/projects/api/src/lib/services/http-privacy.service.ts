import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { PrivacyNotice } from '../models/privacy.models';
import { PrivacyService } from './privacy.service';

@Injectable()
export class HttpPrivacyService extends PrivacyService {
  private readonly http = inject(HttpClient);

  currentNotice(): Observable<PrivacyNotice> {
    return this.http.get<PrivacyNotice>('/api/public/privacy-notice');
  }

  accept(version: string): Observable<void> {
    return this.http.post<void>('/api/me/consents', { version });
  }
}

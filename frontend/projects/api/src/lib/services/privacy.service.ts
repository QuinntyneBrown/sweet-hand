import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { PrivacyNotice } from '../models/privacy.models';
import type { IPrivacyService } from './privacy.service.contract';

@Injectable()
export class PrivacyService implements IPrivacyService {
  private readonly http = inject(HttpClient);

  currentNotice(): Observable<PrivacyNotice> {
    return this.http.get<PrivacyNotice>('/api/public/privacy-notice');
  }

  accept(version: string): Observable<void> {
    return this.http.post<void>('/api/me/consents', { version });
  }
}

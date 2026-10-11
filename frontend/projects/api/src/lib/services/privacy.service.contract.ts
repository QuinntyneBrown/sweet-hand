import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { PrivacyNotice } from '../models/privacy.models';

/** The privacy notice and consent records (consent-to-privacy-notice design, `PrivacyClient`). */
export interface IPrivacyService {
  currentNotice(): Observable<PrivacyNotice>;
  /** Records that the signed-in account accepted `version` (L2-070.3). */
  accept(version: string): Observable<void>;
}

export const PRIVACY_SERVICE = new InjectionToken<IPrivacyService>('PRIVACY_SERVICE');

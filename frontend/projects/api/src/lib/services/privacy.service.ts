import type { Observable } from 'rxjs';
import type { PrivacyNotice } from '../models/privacy.models';

/** The privacy notice and consent records (consent-to-privacy-notice design, `PrivacyClient`). */
export abstract class PrivacyService {
  abstract currentNotice(): Observable<PrivacyNotice>;
  /** Records that the signed-in account accepted `version` (L2-070.3). */
  abstract accept(version: string): Observable<void>;
}

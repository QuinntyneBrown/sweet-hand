import type { Observable } from 'rxjs';
import type { LaunchConfirmation } from '../models/launch-confirmation';
import type { LaunchListStatus } from '../models/launch-list-status';
import type { LaunchRemoval } from '../models/launch-removal';
import type { LaunchSignUpRequest } from '../models/launch-sign-up-request';

/** The launch list (join, confirm and leave launch list designs). Errors arrive as `HttpErrorResponse`. */
export abstract class LaunchListService {
  abstract status(): Observable<LaunchListStatus>;
  /** Succeeds with no body for every accepted sign-up, whatever the address's history (L2-098). */
  abstract signUp(request: LaunchSignUpRequest): Observable<void>;
  abstract confirm(token: string): Observable<LaunchConfirmation>;
  abstract remove(token: string): Observable<LaunchRemoval>;
}

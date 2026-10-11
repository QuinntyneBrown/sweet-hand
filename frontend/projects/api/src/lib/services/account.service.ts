import type { Observable } from 'rxjs';
import type { AccountView, ActiveSession, ChangePasswordRequest, DeleteAccountRequest, UpdateDetailsRequest } from '../models/account.models';

/**
 * The signed-in person's own account: details, password, sessions, data
 * export and deletion (manage-sessions, export-personal-data and
 * delete-account designs).
 */
export abstract class AccountService {
  abstract account(): Observable<AccountView>;
  abstract updateDetails(request: UpdateDetailsRequest): Observable<AccountView>;
  /** Other sessions end; this one stays signed in. */
  abstract changePassword(request: ChangePasswordRequest): Observable<void>;
  abstract sessions(): Observable<ActiveSession[]>;
  /** Not found (404) for a session that is not the caller's own. */
  abstract endSession(id: string): Observable<void>;
  abstract requestDataExport(): Observable<AccountView>;
  /** Signs the person out; the account is closed and deleted within 30 days (L2-072). */
  abstract deleteAccount(request: DeleteAccountRequest): Observable<void>;
}

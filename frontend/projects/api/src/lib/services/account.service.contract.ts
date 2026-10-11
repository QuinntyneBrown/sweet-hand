import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AccountView, ActiveSession, ChangePasswordRequest, DeleteAccountRequest, UpdateDetailsRequest } from '../models/account.models';

/**
 * The signed-in person's own account: details, password, sessions, data
 * export and deletion (manage-sessions, export-personal-data and
 * delete-account designs).
 */
export interface IAccountService {
  account(): Observable<AccountView>;
  updateDetails(request: UpdateDetailsRequest): Observable<AccountView>;
  /** Other sessions end; this one stays signed in. */
  changePassword(request: ChangePasswordRequest): Observable<void>;
  sessions(): Observable<ActiveSession[]>;
  /** Not found (404) for a session that is not the caller's own. */
  endSession(id: string): Observable<void>;
  requestDataExport(): Observable<AccountView>;
  /** Signs the person out; the account is closed and deleted within 30 days (L2-072). */
  deleteAccount(request: DeleteAccountRequest): Observable<void>;
}

export const ACCOUNT_SERVICE = new InjectionToken<IAccountService>('ACCOUNT_SERVICE');

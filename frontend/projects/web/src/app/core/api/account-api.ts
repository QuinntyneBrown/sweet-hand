import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { AccountView, ActiveSession, ChangePasswordRequest, DeleteAccountRequest, UpdateDetailsRequest } from './account.models';

/**
 * The signed-in person's own account: details, password, sessions, data
 * export and deletion (manage-sessions, export-personal-data and
 * delete-account designs).
 */
export abstract class AccountApi {
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

@Injectable()
export class HttpAccountApi extends AccountApi {
  private readonly http = inject(HttpClient);

  account(): Observable<AccountView> {
    return this.http.get<AccountView>('/api/me/account');
  }

  updateDetails(request: UpdateDetailsRequest): Observable<AccountView> {
    return this.http.put<AccountView>('/api/me/details', request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>('/api/me/password', request);
  }

  sessions(): Observable<ActiveSession[]> {
    return this.http.get<ActiveSession[]>('/api/me/sessions');
  }

  endSession(id: string): Observable<void> {
    return this.http.delete<void>(`/api/me/sessions/${encodeURIComponent(id)}`);
  }

  requestDataExport(): Observable<AccountView> {
    return this.http.post<AccountView>('/api/me/data-exports', {});
  }

  deleteAccount(request: DeleteAccountRequest): Observable<void> {
    return this.http.post<void>('/api/me/deletion', request);
  }
}

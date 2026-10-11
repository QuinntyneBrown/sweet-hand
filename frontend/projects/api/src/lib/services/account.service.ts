import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { AccountView, ActiveSession, ChangePasswordRequest, DeleteAccountRequest, UpdateDetailsRequest } from '../models/account.models';
import type { IAccountService } from './account.service.contract';

@Injectable()
export class AccountService implements IAccountService {
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

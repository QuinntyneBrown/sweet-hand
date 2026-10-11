import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { SessionView } from '../models/session.models';
import type { ISessionService } from './session.service.contract';

@Injectable()
export class SessionService implements ISessionService {
  private readonly http = inject(HttpClient);

  current(): Observable<SessionView> {
    return this.http.get<SessionView>('/api/session');
  }

  signOut(): Observable<void> {
    return this.http.post<void>('/api/identity/sign-out', {});
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { SessionView } from '../models/session-view';
import { SessionService } from './session.service';

@Injectable()
export class HttpSessionService extends SessionService {
  private readonly http = inject(HttpClient);

  current(): Observable<SessionView> {
    return this.http.get<SessionView>('/api/session');
  }

  signOut(): Observable<void> {
    return this.http.post<void>('/api/identity/sign-out', {});
  }
}

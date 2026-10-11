import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { SessionView } from '../api/session.models';

/** The signed-in session contract (ADR 0003). */
export abstract class SessionApi {
  abstract current(): Observable<SessionView>;
  abstract signOut(): Observable<void>;
}

@Injectable()
export class HttpSessionApi extends SessionApi {
  private readonly http = inject(HttpClient);

  current(): Observable<SessionView> {
    return this.http.get<SessionView>('/api/session');
  }

  signOut(): Observable<void> {
    return this.http.post<void>('/api/identity/sign-out', {});
  }
}

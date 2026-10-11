import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { SessionView } from '../models/session.models';

/** The signed-in session contract (ADR 0003). */
export interface ISessionService {
  current(): Observable<SessionView>;
  signOut(): Observable<void>;
}

export const SESSION_SERVICE = new InjectionToken<ISessionService>('SESSION_SERVICE');

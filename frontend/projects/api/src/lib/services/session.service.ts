import type { Observable } from 'rxjs';
import type { SessionView } from '../models/session.models';

/** The signed-in session contract (ADR 0003). */
export abstract class SessionService {
  abstract current(): Observable<SessionView>;
  abstract signOut(): Observable<void>;
}

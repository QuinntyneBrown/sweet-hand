import { signedIn, type Area } from '../http/router.ts';
import { accountView } from './account-view.ts';
import { endSession, listSessions } from './active-sessions.ts';

/** The signed-in person's own account (docs/detailed-designs/privacy, identity-and-security/manage-sessions). */
export const accountArea: Area = (r) => {
  r.get('/api/me/account', signedIn, accountView);
  r.get('/api/me/sessions', signedIn, listSessions);
  r.delete('/api/me/sessions/:id', signedIn, endSession);
};

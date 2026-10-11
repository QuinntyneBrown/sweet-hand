import { signedIn, type Area } from '../http/router.ts';
import { accountView } from './account-view.ts';

/** The signed-in person's own account (docs/detailed-designs/privacy, identity-and-security/manage-sessions). */
export const accountArea: Area = (r) => {
  r.get('/api/me/account', signedIn, accountView);
};

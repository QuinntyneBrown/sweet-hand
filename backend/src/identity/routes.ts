import { anonymous, type Area } from '../http/router.ts';
import { sessionView } from './session-view.ts';
import { signIn, signOut } from './sign-in.ts';
import { completeSecondFactor } from './second-factor.ts';
import { registerCaterer, registerCustomer } from './registration.ts';

/** Identity endpoints (docs/detailed-designs/identity-and-security). */
export const identityArea: Area = (r) => {
  // Anonymous by choice: visitors learn they are not signed in.
  r.get('/api/session', anonymous, sessionView);
  r.post('/api/identity/sign-in', anonymous, signIn);
  r.post('/api/identity/sign-out', anonymous, signOut);
  // Anonymous by choice: the caller holds a session that is still waiting for this step.
  r.post('/api/identity/second-factor', anonymous, completeSecondFactor);
  r.post('/api/identity/registrations', anonymous, registerCustomer);
  r.post('/api/identity/registrations/caterer', anonymous, registerCaterer);
};

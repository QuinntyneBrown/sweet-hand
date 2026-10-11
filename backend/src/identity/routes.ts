import { anonymous, signedIn, type Area } from '../http/router.ts';
import { acceptPrivacyNotice, privacyNotice } from './consent.ts';
import { sessionView } from './session-view.ts';
import { signIn, signOut } from './sign-in.ts';
import { completeSecondFactor } from './second-factor.ts';
import { registerCaterer, registerCustomer } from './registration.ts';
import { resendVerification, verifyEmail } from './verification.ts';
import { openResetLink, requestPasswordReset, resetPassword } from './password-reset.ts';

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
  // Links from emails work without a session, by design.
  r.post('/api/identity/email-verifications', anonymous, verifyEmail);
  r.post('/api/identity/email-verifications/resend', anonymous, resendVerification);
  r.post('/api/identity/password-reset-requests', anonymous, requestPasswordReset);
  r.get('/api/identity/password-resets/:token', anonymous, openResetLink);
  r.post('/api/identity/password-resets', anonymous, resetPassword);
  // Public by deliberate choice: anyone may read the privacy notice.
  r.get('/api/public/privacy-notice', anonymous, privacyNotice);
  r.post('/api/me/consents', signedIn, acceptPrivacyNotice);
};

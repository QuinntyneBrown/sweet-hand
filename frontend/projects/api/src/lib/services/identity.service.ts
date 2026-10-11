import type { Observable } from 'rxjs';
import type { EmailVerified } from '../models/email-verified';
import type { PasswordResetLink } from '../models/password-reset-link';
import type { PasswordResetRequest } from '../models/password-reset-request';
import type { RegisterCatererRequest } from '../models/register-caterer-request';
import type { RegisterRequest } from '../models/register-request';
import type { ResendVerificationRequest } from '../models/resend-verification-request';
import type { ResetPasswordRequest } from '../models/reset-password-request';
import type { SecondFactorRequest } from '../models/second-factor-request';
import type { SignInRequest } from '../models/sign-in-request';
import type { SignInResult } from '../models/sign-in-result';
import type { VerificationSent } from '../models/verification-sent';

/** Accounts: sign in, registration, verification and password reset (ADR 0003). */
export abstract class IdentityService {
  abstract signIn(request: SignInRequest): Observable<SignInResult>;
  /** The same answer whether or not the email already has an account (L2-076). */
  abstract register(request: RegisterRequest): Observable<void>;
  /** Signs the new caterer in, so they can set up their profile (L2-037.1). */
  abstract registerCaterer(request: RegisterCatererRequest): Observable<void>;
  abstract completeSecondFactor(request: SecondFactorRequest): Observable<SignInResult>;
  abstract verifyEmail(token: string): Observable<EmailVerified>;
  /**
   * Sends a new verification link: to the signed-in account, to the account an
   * expired `token` belongs to, or to `email` if it waits for verification.
   * The answer is the same whether or not such an account exists (L2-076).
   */
  abstract resendVerification(from?: ResendVerificationRequest): Observable<VerificationSent>;
  abstract requestPasswordReset(request: PasswordResetRequest): Observable<void>;
  abstract passwordReset(token: string): Observable<PasswordResetLink>;
  abstract resetPassword(request: ResetPasswordRequest): Observable<void>;
}

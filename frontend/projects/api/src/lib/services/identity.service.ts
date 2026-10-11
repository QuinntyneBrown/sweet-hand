import type { Observable } from 'rxjs';
import type { EmailVerified, PasswordResetLink, PasswordResetRequest, RegisterCatererRequest, RegisterRequest, ResendVerificationRequest, ResetPasswordRequest, SecondFactorRequest, SignInRequest, SignInResult, VerificationSent } from '../models/identity.models';

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

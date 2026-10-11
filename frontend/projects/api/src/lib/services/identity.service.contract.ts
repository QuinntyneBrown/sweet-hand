import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { EmailVerified, PasswordResetLink, PasswordResetRequest, RegisterCatererRequest, RegisterRequest, ResendVerificationRequest, ResetPasswordRequest, SecondFactorRequest, SignInRequest, SignInResult, VerificationSent } from '../models/identity.models';

/** Accounts: sign in, registration, verification and password reset (ADR 0003). */
export interface IIdentityService {
  signIn(request: SignInRequest): Observable<SignInResult>;
  /** The same answer whether or not the email already has an account (L2-076). */
  register(request: RegisterRequest): Observable<void>;
  /** Signs the new caterer in, so they can set up their profile (L2-037.1). */
  registerCaterer(request: RegisterCatererRequest): Observable<void>;
  completeSecondFactor(request: SecondFactorRequest): Observable<SignInResult>;
  verifyEmail(token: string): Observable<EmailVerified>;
  /**
   * Sends a new verification link: to the signed-in account, to the account an
   * expired `token` belongs to, or to `email` if it waits for verification.
   * The answer is the same whether or not such an account exists (L2-076).
   */
  resendVerification(from?: ResendVerificationRequest): Observable<VerificationSent>;
  requestPasswordReset(request: PasswordResetRequest): Observable<void>;
  passwordReset(token: string): Observable<PasswordResetLink>;
  resetPassword(request: ResetPasswordRequest): Observable<void>;
}

export const IDENTITY_SERVICE = new InjectionToken<IIdentityService>('IDENTITY_SERVICE');

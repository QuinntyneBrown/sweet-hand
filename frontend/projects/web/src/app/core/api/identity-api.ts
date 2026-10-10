import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  EmailVerified,
  PasswordResetLink,
  PasswordResetRequest,
  RegisterCatererRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SecondFactorRequest,
  SignInRequest,
  SignInResult,
  VerificationSent,
} from './identity.models';

/** Accounts: sign in, registration, verification and password reset (ADR 0003). */
export abstract class IdentityApi {
  abstract signIn(request: SignInRequest): Observable<SignInResult>;
  /** The same answer whether or not the email already has an account (L2-076). */
  abstract register(request: RegisterRequest): Observable<void>;
  /** Signs the new caterer in, so they can set up their profile (L2-037.1). */
  abstract registerCaterer(request: RegisterCatererRequest): Observable<void>;
  abstract completeSecondFactor(request: SecondFactorRequest): Observable<SignInResult>;
  abstract verifyEmail(token: string): Observable<EmailVerified>;
  /** Sends a new link to the signed-in account, or to `email` if it is waiting for verification. */
  abstract resendVerification(email?: string | null): Observable<VerificationSent>;
  abstract requestPasswordReset(request: PasswordResetRequest): Observable<void>;
  abstract passwordReset(token: string): Observable<PasswordResetLink>;
  abstract resetPassword(request: ResetPasswordRequest): Observable<void>;
}

@Injectable()
export class HttpIdentityApi extends IdentityApi {
  private readonly http = inject(HttpClient);

  signIn(request: SignInRequest): Observable<SignInResult> {
    return this.http.post<SignInResult>('/api/identity/sign-in', request);
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http.post<void>('/api/identity/registrations', request);
  }

  registerCaterer(request: RegisterCatererRequest): Observable<void> {
    return this.http.post<void>('/api/identity/registrations/caterer', request);
  }

  completeSecondFactor(request: SecondFactorRequest): Observable<SignInResult> {
    return this.http.post<SignInResult>('/api/identity/second-factor', request);
  }

  verifyEmail(token: string): Observable<EmailVerified> {
    return this.http.post<EmailVerified>('/api/identity/email-verifications', { token });
  }

  resendVerification(email?: string | null): Observable<VerificationSent> {
    return this.http.post<VerificationSent>('/api/identity/email-verifications/resend', email ? { email } : {});
  }

  requestPasswordReset(request: PasswordResetRequest): Observable<void> {
    return this.http.post<void>('/api/identity/password-reset-requests', request);
  }

  passwordReset(token: string): Observable<PasswordResetLink> {
    return this.http.get<PasswordResetLink>(`/api/identity/password-resets/${encodeURIComponent(token)}`);
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>('/api/identity/password-resets', request);
  }
}

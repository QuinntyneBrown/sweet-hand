import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { EmailVerified, PasswordResetLink, PasswordResetRequest, RegisterCatererRequest, RegisterRequest, ResendVerificationRequest, ResetPasswordRequest, SecondFactorRequest, SignInRequest, SignInResult, VerificationSent } from '../models/identity.models';
import type { IIdentityService } from './identity.service.contract';

@Injectable()
export class IdentityService implements IIdentityService {
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

  resendVerification(from: ResendVerificationRequest = {}): Observable<VerificationSent> {
    return this.http.post<VerificationSent>('/api/identity/email-verifications/resend', from);
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

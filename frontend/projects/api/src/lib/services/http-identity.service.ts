import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
import { IdentityService } from './identity.service';

@Injectable()
export class HttpIdentityService extends IdentityService {
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

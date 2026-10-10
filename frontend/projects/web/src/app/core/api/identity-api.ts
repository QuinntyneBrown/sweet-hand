import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { SignInRequest, SignInResult } from './identity.models';

/** Accounts: sign in, registration, verification and password reset (ADR 0003). */
export abstract class IdentityApi {
  abstract signIn(request: SignInRequest): Observable<SignInResult>;
}

@Injectable()
export class HttpIdentityApi extends IdentityApi {
  private readonly http = inject(HttpClient);

  signIn(request: SignInRequest): Observable<SignInResult> {
    return this.http.post<SignInResult>('/api/identity/sign-in', request);
  }
}

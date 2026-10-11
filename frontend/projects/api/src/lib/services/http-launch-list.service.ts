import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { type Observable, defer, map, of, switchMap } from 'rxjs';
import type { LaunchConfirmation } from '../models/launch-confirmation';
import type { LaunchListStatus } from '../models/launch-list-status';
import type { LaunchRemoval } from '../models/launch-removal';
import type { LaunchSignUpRequest } from '../models/launch-sign-up-request';
import { LaunchListService } from './launch-list.service';

@Injectable()
export class HttpLaunchListService extends LaunchListService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  status(): Observable<LaunchListStatus> {
    return this.http.get<LaunchListStatus>('/api/public/launch-list');
  }

  signUp(request: LaunchSignUpRequest): Observable<void> {
    return this.withCsrfCookie(() => this.http.post<unknown>('/api/launch-list/sign-ups', request).pipe(map(() => undefined)));
  }

  confirm(token: string): Observable<LaunchConfirmation> {
    return this.withCsrfCookie(() => this.http.post<LaunchConfirmation>('/api/launch-list/confirmations', { token }));
  }

  remove(token: string): Observable<LaunchRemoval> {
    return this.withCsrfCookie(() => this.http.post<LaunchRemoval>('/api/launch-list/removals', { token }));
  }

  /**
   * The launch page makes no request on load (L2-105.5), so the first state
   * change may find no `XSRF-TOKEN` cookie; the status call sets it first.
   */
  private withCsrfCookie<T>(send: () => Observable<T>): Observable<T> {
    return defer(() => (/(^|;\s*)XSRF-TOKEN=/.test(this.document.cookie) ? of(null) : this.status())).pipe(switchMap(() => send()));
  }
}

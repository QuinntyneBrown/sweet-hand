import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { paths } from '../core/routing/paths';

/**
 * Whole-page conditions any read can hit: rate limiting (L2-082.1) and planned
 * maintenance (L2-088). The page is replaced without changing the address, so
 * trying again reloads the same URL. Form submissions handle their own 429s.
 */
export const systemErrorsInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (req.method === 'GET' && error instanceof HttpErrorResponse) {
        if (error.status === 429) {
          void router.navigateByUrl(paths.system.rateLimited, { skipLocationChange: true });
        } else if (error.status === 503 && error.error?.until) {
          void router.navigate([paths.system.maintenance], {
            skipLocationChange: true,
            queryParams: { from: error.error.from, until: error.error.until },
          });
        }
      }
      return throwError(() => error);
    }),
  );
};

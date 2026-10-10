import { inject } from '@angular/core';
import { RedirectCommand, Router, type CanActivateFn } from '@angular/router';
import type { Role } from '../api/session.models';
import { Session } from './session';

/**
 * Pages that need an account (L2-013): a visitor goes to sign in and comes
 * back afterwards; a signed-in person without the role sees "No access" at the
 * same address (L2-056.3). The server still checks every request (L2-079).
 */
export function requireRole(...roles: Role[]): CanActivateFn {
  return (_route, state) => {
    const session = inject(Session);
    const router = inject(Router);
    const user = session.user();
    if (!user) return router.createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } });
    if (roles.length && !roles.includes(user.role)) {
      return new RedirectCommand(router.parseUrl('/403'), { skipLocationChange: true });
    }
    return true;
  };
}

/** Operator pages only an Admin may open (L2-056.5). */
export const requireAdmin: CanActivateFn = () => {
  const session = inject(Session);
  const router = inject(Router);
  return session.user()?.admin ? true : new RedirectCommand(router.parseUrl('/403'), { skipLocationChange: true });
};

/** Only same-site paths are followed after sign-in, never another origin. */
export function safeReturnUrl(value: string | null | undefined): string | null {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : null;
}

export function landingFor(role: Role): string {
  return role === 'Caterer' ? '/dashboard' : role === 'Operator' ? '/sign-in/verify' : '/inbox';
}

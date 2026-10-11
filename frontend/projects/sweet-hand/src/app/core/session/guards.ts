import { inject } from '@angular/core';
import { RedirectCommand, Router, type CanActivateFn } from '@angular/router';
import { Session } from './session';
import { type Role } from '@sweet-hand/api';
import { landingFor, paths } from '../routing/paths';

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
    // An operator part-way through signing in finishes the second step first (L2-056.2).
    if (!user && session.pendingSecondFactor()) return router.createUrlTree([paths.signInVerify], { queryParams: { returnUrl: state.url } });
    if (!user) return router.createUrlTree([paths.signIn], { queryParams: { returnUrl: state.url } });
    if (roles.length && !roles.includes(user.role)) {
      return new RedirectCommand(router.parseUrl(paths.system.forbidden), { skipLocationChange: true });
    }
    return true;
  };
}

/** Operator pages only an Admin may open (L2-056.5). */
export const requireAdmin: CanActivateFn = () => {
  const session = inject(Session);
  const router = inject(Router);
  return session.user()?.admin ? true : new RedirectCommand(router.parseUrl(paths.system.forbidden), { skipLocationChange: true });
};

/** The second-step page is only for an operator who still owes it (L2-056.2). */
export const requirePendingSecondFactor: CanActivateFn = () => {
  const session = inject(Session);
  const router = inject(Router);
  if (session.pendingSecondFactor()) return true;
  const user = session.user();
  return router.parseUrl(user ? landingFor(user.role) : paths.signIn);
};

/** Only same-site paths are followed after sign-in, never another origin. */
export function safeReturnUrl(value: string | null | undefined): string | null {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : null;
}

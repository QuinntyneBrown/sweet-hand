import type { Router } from '../lib/router.ts';
import { ok, type Reply } from '../lib/http.ts';
import { startSession, type Store } from '../lib/store.ts';
import type { SignInRequest, SignInResult } from '../../projects/web/src/app/core/api/identity.models.ts';

const CURRENT_PRIVACY_VERSION = '1.0';

export const sessionCookie = (token: string) => `sh_session=${token}; Path=/; HttpOnly; SameSite=Lax`;

/** Identity endpoints (docs/detailed-designs/identity-and-security). */
export function registerIdentity(r: Router<Store>): void {
  r.post('/api/identity/sign-in', (ctx): Reply => {
    const body = (ctx.body ?? {}) as Partial<SignInRequest>;
    const email = String(body.email ?? '').trim().toLowerCase();
    const user = ctx.store.users.find((u) => u.email.toLowerCase() === email && !u.deleted);
    // One message, status and timing for an unknown email and a wrong password (L2-076.3).
    if (!user || user.password !== body.password) {
      if (user) user.failedSignIns = (user.failedSignIns ?? 0) + 1;
      return { status: 401, body: { title: 'Email or password is incorrect' } };
    }
    user.failedSignIns = 0;
    const token = startSession(ctx.store, user);
    const result: SignInResult = {
      secondFactorRequired: user.role === 'Operator',
      privacyUpdateRequired: user.acceptedPrivacyVersion !== CURRENT_PRIVACY_VERSION,
    };
    return { ...ok(result), headers: { 'set-cookie': sessionCookie(token) } };
  });
}

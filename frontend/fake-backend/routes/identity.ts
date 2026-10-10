import type { Router } from '../lib/router.ts';
import { ok, type Reply } from '../lib/http.ts';
import { startSession, type Store } from '../lib/store.ts';
import type { User } from '../seed/users.ts';
import type { SignInLocked, SignInRequest, SignInResult } from '../../projects/web/src/app/core/api/identity.models.ts';

const CURRENT_PRIVACY_VERSION = '1.0';
const MINUTE = 60_000;
/** 5 failed sign-ins for one account within 15 minutes pause it for 15 minutes (L2-076.4). */
const ACCOUNT_FAILURES = 5;
const WINDOW_MS = 15 * MINUTE;

export const sessionCookie = (token: string) => `sh_session=${token}; Path=/; HttpOnly; SameSite=Lax`;

/** Records an email the platform would send, for tests to read through /__fake/state. */
export function sendEmail(store: Store, to: string, kind: string): void {
  store.account.outbox.push({ to, kind, at: store.now.toISOString() });
}

export function findUser(store: Store, email: unknown): User | undefined {
  const e = String(email ?? '').trim().toLowerCase();
  return store.users.find((u) => u.email.toLowerCase() === e && !u.deleted);
}

function recordFailure(store: Store, user: User): void {
  const now = store.now.getTime();
  user.failedSignIns = (user.failedSignIns ?? 0) + 1;
  user.failedSignInsAt = [...(user.failedSignInsAt ?? []), store.now.toISOString()].filter((t) => now - Date.parse(t) < WINDOW_MS);
  if (user.failedSignInsAt.length >= ACCOUNT_FAILURES) {
    user.lockedUntil = new Date(now + WINDOW_MS).toISOString();
    user.failedSignInsAt = [];
    sendEmail(store, user.email, 'sign-in-paused');
  }
}

function locked(store: Store, user: User | undefined): Reply | null {
  if (!user?.lockedUntil || Date.parse(user.lockedUntil) <= store.now.getTime()) return null;
  const body: SignInLocked = { title: 'Sign-in is paused for this account', lockedUntil: user.lockedUntil };
  return { status: 423, body };
}

/** Identity endpoints (docs/detailed-designs/identity-and-security). */
export function registerIdentity(r: Router<Store>): void {
  r.post('/api/identity/sign-in', (ctx): Reply => {
    const body = (ctx.body ?? {}) as Partial<SignInRequest>;
    const user = findUser(ctx.store, body.email);
    const paused = locked(ctx.store, user);
    if (paused) return paused;
    // One message, status and timing for an unknown email and a wrong password (L2-076.3).
    if (!user || user.password !== body.password) {
      if (user) recordFailure(ctx.store, user);
      return { status: 401, body: { title: 'Email or password is incorrect' } };
    }
    user.failedSignIns = 0;
    user.failedSignInsAt = [];
    const token = startSession(ctx.store, user);
    const result: SignInResult = {
      secondFactorRequired: user.role === 'Operator',
      privacyUpdateRequired: user.acceptedPrivacyVersion !== CURRENT_PRIVACY_VERSION,
    };
    return { ...ok(result), headers: { 'set-cookie': sessionCookie(token) } };
  });
}

/** Named store changes for identity tests (`backend.scenario(name, args)`). */
export const identityScenarios: Record<string, (store: Store, args: any) => unknown> = {
  /** The account has had 5 failed sign-ins: sign-in is paused for 15 minutes (L2-076.4). */
  'pause-sign-in': (store, { email }: { email: string }) => {
    const user = findUser(store, email);
    if (user) user.lockedUntil = new Date(store.now.getTime() + WINDOW_MS).toISOString();
  },
};

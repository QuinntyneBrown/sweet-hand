import type { Router } from '../lib/router.ts';
import { invalid, ok, type Reply } from '../lib/http.ts';
import { newId, startSession, type Store } from '../lib/store.ts';
import type { User } from '../seed/users.ts';
import type { AccountToken } from '../seed/account.ts';
import type { RegisterRequest, SignInLocked, SignInRequest, SignInResult } from '../../projects/web/src/app/core/api/identity.models.ts';

const MINUTE = 60_000;
/** 5 failed sign-ins for one account within 15 minutes pause it for 15 minutes (L2-076.4). */
const ACCOUNT_FAILURES = 5;
const WINDOW_MS = 15 * MINUTE;
/** 20 failed sign-ins from one network within 15 minutes need a bot-protection check (L2-076.5). */
const NETWORK_FAILURES = 20;

export const sessionCookie = (token: string) => `sh_session=${token}; Path=/; HttpOnly; SameSite=Lax`;

/** Records an email the platform would send, for tests to read through /__fake/state. */
export function sendEmail(store: Store, to: string, kind: string, link?: string): void {
  store.account.outbox.push({ to, kind, at: store.now.toISOString(), ...(link ? { link } : {}) });
}

/** A stand-in for the 100,000 most common breached passwords (L2-076.1). */
const BREACHED = new Set(['sunshine2026', 'sunshine2025', 'password1234', 'qwertyuiop12', 'iloveyou2026', '123456789012', 'letmein12345']);

/** The rule the server applies to every new password; the client checks the length first (L2-076.1). */
export function passwordProblem(password: unknown): string | null {
  const p = typeof password === 'string' ? password : '';
  if ([...p].length < 12 || [...p].length > 128) return 'Use 12 to 128 characters';
  if (BREACHED.has(p.toLowerCase())) return 'This password is too common';
  return null;
}

export function currentPrivacyVersion(store: Store): string {
  return store.account.privacyNotice.version;
}

/** Issues a single-use link and invalidates earlier unused ones of the same kind (L2-077). */
export function issueToken(store: Store, user: User, kind: AccountToken['kind']): string {
  for (const t of store.account.tokens) if (t.userId === user.id && t.kind === kind && !t.consumedAt) t.consumedAt = store.now.toISOString();
  const token = newId().replace(/-/g, '');
  store.account.tokens.push({ kind, token, userId: user.id, issuedAt: store.now.toISOString() });
  return token;
}

export function sendVerification(store: Store, user: User): void {
  const token = issueToken(store, user, 'verify');
  user.verificationSentAt = store.now.toISOString();
  sendEmail(store, user.email, 'verify-email', `/verify-email/${token}`);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const length = (v: string) => [...v].length;

export function findUser(store: Store, email: unknown): User | undefined {
  const e = String(email ?? '').trim().toLowerCase();
  return store.users.find((u) => u.email.toLowerCase() === e && !u.deleted);
}

/** Tokens from the frontend's LocalBotChallenge for this action (L2-082.2). */
export function validChallenge(token: unknown, action: string): boolean {
  return typeof token === 'string' && token.startsWith(`local:${action}:`);
}

function recent(store: Store, times: string[]): string[] {
  const now = store.now.getTime();
  return times.filter((t) => now - Date.parse(t) < WINDOW_MS);
}

function recordFailure(store: Store, user: User | undefined): void {
  store.account.networkFailures = [...recent(store, store.account.networkFailures), store.now.toISOString()];
  if (!user) return;
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
    // Past the network threshold nothing is checked until the challenge passes (L2-076.5, L2-082.2).
    if (recent(ctx.store, ctx.store.account.networkFailures).length >= NETWORK_FAILURES && !validChallenge(body.challengeToken, 'sign-in')) {
      return { status: 400, body: { title: 'Confirm you’re a person', challengeRequired: true } };
    }
    const user = findUser(ctx.store, body.email);
    const paused = locked(ctx.store, user);
    if (paused) return paused;
    // One message, status and timing for an unknown email and a wrong password (L2-076.3).
    if (!user || user.password !== body.password) {
      recordFailure(ctx.store, user);
      return { status: 401, body: { title: 'Email or password is incorrect' } };
    }
    user.failedSignIns = 0;
    user.failedSignInsAt = [];
    const token = startSession(ctx.store, user);
    const result: SignInResult = {
      secondFactorRequired: user.role === 'Operator',
      privacyUpdateRequired: user.acceptedPrivacyVersion !== currentPrivacyVersion(ctx.store),
    };
    return { ...ok(result), headers: { 'set-cookie': sessionCookie(token) } };
  });

  /**
   * Customer registration (register-customer design). The role is never read
   * from the body (L2-056.1). An email that already has an account gets the
   * same 202, and its owner an email instead (L2-076).
   */
  r.post('/api/identity/registrations', (ctx): Reply => {
    const body = (ctx.body ?? {}) as Partial<RegisterRequest>;
    if (!validChallenge(body.challengeToken, 'register')) return invalid({ challengeToken: ['Confirm you’re a person'] });
    const displayName = text(body.displayName);
    const email = text(body.email);
    const errors: Record<string, string[]> = {};
    if (length(displayName) < 2 || length(displayName) > 50) errors['name'] = ['Enter a display name of 2 to 50 characters'];
    if (!EMAIL.test(email)) errors['email'] = ['Enter an email address like name@example.com'];
    const weak = passwordProblem(body.password);
    if (weak) errors['password'] = [weak];
    if (body.consent !== true) errors['consent'] = ['Tick the box to agree to the privacy notice'];
    if (Object.keys(errors).length) return invalid(errors);

    const existing = findUser(ctx.store, email);
    if (existing) {
      sendEmail(ctx.store, existing.email, 'registration-attempt');
      return { status: 202, body: {} };
    }
    const now = ctx.store.now.toISOString();
    const user: User = {
      id: `user-${newId()}`,
      role: 'Customer',
      displayName,
      email,
      password: String(body.password),
      passwordChangedAt: now,
      emailVerified: false,
      createdAt: now,
      acceptedPrivacyVersion: currentPrivacyVersion(ctx.store),
      acceptedPrivacyAt: now,
    };
    ctx.store.users.push(user);
    sendVerification(ctx.store, user);
    return { status: 202, body: {} };
  });
}

/** Named store changes for identity tests (`backend.scenario(name, args)`). */
export const identityScenarios: Record<string, (store: Store, args: any) => unknown> = {
  /** 20 failed sign-ins from the network in the last 15 minutes (L2-076.5). */
  'many-failed-sign-ins-from-network': (store) => {
    store.account.networkFailures = Array.from({ length: NETWORK_FAILURES }, () => store.now.toISOString());
  },
  /** The account has had 5 failed sign-ins: sign-in is paused for 15 minutes (L2-076.4). */
  'pause-sign-in': (store, { email }: { email: string }) => {
    const user = findUser(store, email);
    if (user) user.lockedUntil = new Date(store.now.getTime() + WINDOW_MS).toISOString();
  },
};

import { randomUUID } from 'node:crypto';
import type { Actor, Request } from '../http/router.ts';
import { serializeCookie } from '../http/cookies.ts';
import { randomToken, sha256 } from '../platform/secrets.ts';
import { liveUser, sessions, type Session, type User } from './model.ts';

export const SESSION_COOKIE = 'sh_session';

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

/** Idle and absolute timeouts by role (L2-078). */
const TIMEOUTS = {
  Customer: { idle: 14 * DAY, absolute: 30 * DAY },
  Caterer: { idle: 14 * DAY, absolute: 30 * DAY },
  Operator: { idle: 30 * MINUTE, absolute: 12 * 60 * MINUTE },
} as const;

/** Whether the app runs over HTTPS; set once by the composition root. */
let secureCookies = false;
export function useSecureCookies(on: boolean): void {
  secureCookies = on;
}

export function sessionCookie(req: Request, token: string): void {
  req.cookiesOut.push(serializeCookie(SESSION_COOKIE, token, { httpOnly: true, secure: secureCookies }));
}

export function clearSessionCookie(req: Request): void {
  req.cookiesOut.push(serializeCookie(SESSION_COOKIE, '', { httpOnly: true, secure: secureCookies, maxAgeSeconds: 0 }));
}

/** "Chrome on Windows": only the coarse device type is kept, never the user agent (manage-sessions design). */
export function deviceOf(userAgent: string | undefined): string {
  const ua = userAgent ?? '';
  const browser = /SamsungBrowser/.test(ua)
    ? 'Samsung Internet'
    : /Edg\//.test(ua)
      ? 'Edge'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'A browser';
  const os = /iPhone/.test(ua)
    ? 'iPhone'
    : /iPad/.test(ua)
      ? 'iPad'
      : /Android/.test(ua)
        ? 'Android'
        : /Windows/.test(ua)
          ? 'Windows'
          : /Mac OS X/.test(ua)
            ? 'Mac'
            : /Linux/.test(ua)
              ? 'Linux'
              : 'another device';
  return `${browser} on ${os}`;
}

/** The session the request's cookie names, if it exists. */
export async function currentSession(req: Request): Promise<Session | undefined> {
  const token = req.cookies[SESSION_COOKIE];
  return token ? sessions(req.tx).findOne({ tokenHash: sha256(token) }) : undefined;
}

/**
 * Creates a session and sets its cookie. Any session the browser held before
 * is ended first, so an identifier is never upgraded (L2-078.2).
 */
export async function startSession(req: Request, user: User, options: { pendingSecondFactor?: boolean } = {}): Promise<string> {
  await endCurrentSession(req);
  const token = randomToken();
  const now = req.now.toISOString();
  await sessions(req.tx).put({
    id: `ses-${randomUUID()}`,
    tokenHash: sha256(token),
    userId: user.id,
    device: deviceOf(req.headers['user-agent']),
    createdAt: now,
    lastActiveAt: now,
    ...(options.pendingSecondFactor ? { pendingSecondFactor: true } : {}),
  });
  sessionCookie(req, token);
  return token;
}

/** Ends the browser's session, if any; true when there was one. */
export async function endCurrentSession(req: Request): Promise<boolean> {
  const session = await currentSession(req);
  if (session) await sessions(req.tx).delete(session.id);
  return !!session;
}

/** Ends every session of the account except `keepId` (password reset and change, deletion). */
export async function endSessionsOf(req: Request, userId: string, keepId?: string): Promise<void> {
  for (const s of await sessions(req.tx).find({ userId })) if (s.id !== keepId) await sessions(req.tx).delete(s.id);
}

export function actorOf(user: User, session: Session): Actor {
  return { userId: user.id, role: user.role, admin: !!user.admin, sessionId: session.id };
}

/**
 * The request's signed-in caller (manage-sessions design). A session past its
 * idle or absolute timeout ends here; `locals.expiredEmail` tells the session
 * view that an operator was signed out for being idle (L2-078.3).
 */
export async function authenticate(req: Request): Promise<Actor | undefined> {
  const session = await currentSession(req);
  if (!session) return undefined;
  const user = await liveUser(req.tx, session.userId);
  if (!user) {
    await sessions(req.tx).delete(session.id);
    return undefined;
  }
  const limits = TIMEOUTS[user.role];
  const now = req.now.getTime();
  const timedOut = now - Date.parse(session.lastActiveAt) > limits.idle || now - Date.parse(session.createdAt) > limits.absolute;
  if (session.expired || timedOut) {
    // The session ends here. Only the session check reports why, so another
    // request that notices first leaves the ended session for it to read.
    if (req.path !== '/api/session' && !session.pendingSecondFactor) {
      if (!session.expired) await sessions(req.tx).put({ ...session, expired: true });
      return undefined;
    }
    await sessions(req.tx).delete(session.id);
    clearSessionCookie(req);
    if (!session.pendingSecondFactor) req.locals['expiredEmail'] = user.email;
    return undefined;
  }
  if (session.pendingSecondFactor) {
    req.locals['pendingSecondFactor'] = user;
    return undefined;
  }
  // A session arranged without a browser (test control) learns its device from the first request.
  await sessions(req.tx).put({ ...session, device: session.device || deviceOf(req.headers['user-agent']), lastActiveAt: req.now.toISOString() });
  req.locals['user'] = user;
  return actorOf(user, session);
}

/** The signed-in user's record; only call behind a signed-in endpoint policy. */
export function currentUser(req: Request): User {
  const user = req.locals['user'] as User | undefined;
  if (!user) throw new Error('No signed-in user on this request');
  return user;
}

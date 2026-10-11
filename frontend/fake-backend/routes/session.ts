import type { Router } from '../lib/router.ts';
import { ok } from '../lib/http.ts';
import { currentUser, newId, type Store } from '../lib/store.ts';
import type { SessionUser, SessionView } from '../../projects/api/src/lib/models/session.models.ts';
import type { User } from '../seed/users.ts';
import { privacyUpdateRequired } from './identity.ts';
import { unreadThreads } from './enquiries.ts';
import { queueItems } from './operator.ts';

export function sessionUser(store: Store, user: User): SessionUser {
  const caterer = user.catererId ? store.caterers.find((c) => c.id === user.catererId) : undefined;
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    admin: !!user.admin,
    emailVerified: user.emailVerified,
    emailBounced: !!user.emailBounced,
    caterer: caterer && { id: caterer.id, name: caterer.name, slug: caterer.slug, status: caterer.status },
    secondFactor: user.role === 'Operator' ? (user.secondFactor ?? 'security key') : undefined,
  };
}

/** Ends every session of the account, except `keep` (L2-077.4, L2-072.1, password change). */
export function endSessions(store: Store, userId: string, keep?: string): void {
  for (const [token, id] of [...store.sessions]) if (id === userId && token !== keep) store.sessions.delete(token);
  store.account.sessions = store.account.sessions.filter((s) => s.userId !== userId || s.token === keep);
}

export function endSession(store: Store, token: string): void {
  store.sessions.delete(token);
  store.account.sessions = store.account.sessions.filter((s) => s.token !== token);
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
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'another device';
  return `${browser} on ${os}`;
}

/** Operators are signed out after 30 idle minutes (L2-078.3). */
const OPERATOR_IDLE_MS = 30 * 60_000;

/** The record of the caller's session, created the first time it is seen. */
export function sessionRecord(store: Store, token: string, userId: string, userAgent: string | undefined) {
  let record = store.account.sessions.find((s) => s.token === token);
  if (!record) {
    const now = store.now.toISOString();
    record = { id: `ses-${newId()}`, token, userId, device: deviceOf(userAgent), createdAt: now, lastActiveAt: now };
    store.account.sessions.push(record);
  }
  return record;
}

/** Threads with something unread for a customer or caterer (L2-029). */
export function unreadCount(store: Store, user: User): number {
  return user.role === 'Customer' || user.role === 'Caterer' ? unreadThreads(store, user) : 0;
}

/** Items waiting in the operator review queue (L2-047). */
export function queueCount(store: Store): number {
  return queueItems(store).length;
}

export function registerSession(r: Router<Store>): void {
  r.get('/api/session', (ctx) => {
    const token = ctx.cookies['sh_session'] ?? '';
    let user = currentUser(ctx.store, ctx.cookies);
    let expired: SessionView['expired'] = null;
    if (user) {
      const record = sessionRecord(ctx.store, token, user.id, ctx.headers['user-agent']);
      if (user.role === 'Operator' && ctx.store.now.getTime() - Date.parse(record.lastActiveAt) > OPERATOR_IDLE_MS) {
        endSession(ctx.store, token);
        expired = { email: user.email };
        user = undefined;
      } else {
        record.lastActiveAt = ctx.store.now.toISOString();
      }
    }
    const view: SessionView = user
      ? { user: sessionUser(ctx.store, user), unread: unreadCount(ctx.store, user), queueCount: user.role === 'Operator' ? queueCount(ctx.store) : 0 }
      : { user: null, unread: 0, queueCount: 0 };
    const pendingId = ctx.store.account.pendingSecondFactor[ctx.cookies['sh_session'] ?? ''];
    const pending = pendingId ? ctx.store.users.find((u) => u.id === pendingId && !u.deleted) : undefined;
    if (!user && pending) view.pendingSecondFactor = { email: pending.email, method: pending.secondFactor ?? 'authenticator app' };
    if (user && privacyUpdateRequired(ctx.store, user)) view.privacyUpdateRequired = true;
    if (expired) {
      view.expired = expired;
      return { ...ok(view), headers: { 'set-cookie': 'sh_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax' } };
    }
    return ok(view);
  });

  /** Ends the session on the server (L2-078.4). */
  r.post('/api/identity/sign-out', (ctx) => {
    endSession(ctx.store, ctx.cookies['sh_session'] ?? '');
    delete ctx.store.account.pendingSecondFactor[ctx.cookies['sh_session'] ?? ''];
    return { status: 204, headers: { 'set-cookie': 'sh_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax' } };
  });
}

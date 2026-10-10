import type { Router } from '../lib/router.ts';
import { ok } from '../lib/http.ts';
import { currentUser, type Store } from '../lib/store.ts';
import type { SessionUser, SessionView } from '../../projects/web/src/app/core/api/session.models.ts';
import type { User } from '../seed/users.ts';
import { unreadThreads } from './enquiries.ts';

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
    secondFactor: user.role === 'Operator' ? 'security key' : undefined,
  };
}

/** Ends every session of the account, except `keep` (L2-077.4, L2-072.1, password change). */
export function endSessions(store: Store, userId: string, keep?: string): void {
  for (const [token, id] of [...store.sessions]) if (id === userId && token !== keep) store.sessions.delete(token);
}

/** Unread threads for a customer or caterer. The enquiries area derives this from its threads. */
export function unreadCount(store: Store, user: User): number {
  return user.role === 'Customer' || user.role === 'Caterer' ? unreadThreads(store, user) : 0;
}

export function queueCount(store: Store): number {
  return store.queueCount;
}

export function registerSession(r: Router<Store>): void {
  r.get('/api/session', (ctx) => {
    const user = currentUser(ctx.store, ctx.cookies);
    const view: SessionView = user
      ? { user: sessionUser(ctx.store, user), unread: unreadCount(ctx.store, user), queueCount: user.role === 'Operator' ? queueCount(ctx.store) : 0 }
      : { user: null, unread: 0, queueCount: 0 };
    return ok(view);
  });

  /** Ends the session on the server (L2-078.4). */
  r.post('/api/identity/sign-out', (ctx) => {
    ctx.store.sessions.delete(ctx.cookies['sh_session'] ?? '');
    return { status: 204, headers: { 'set-cookie': 'sh_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax' } };
  });
}

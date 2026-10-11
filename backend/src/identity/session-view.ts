import type { Request, Reply } from '../http/endpoint.ts';
import { ok } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { caterers } from '../caterers/model.ts';
import type { SessionUser } from '@contract/session-user.ts';
import type { SessionView } from '@contract/session-view.ts';
import type { User } from './model.ts';
import { privacyUpdateRequired } from './privacy.ts';

/** Counts other areas contribute to the session view (unread threads, review queue). */
export interface SessionCounters {
  unread?: (tx: Transaction, user: User) => Promise<number>;
  queueCount?: (tx: Transaction, now: Date) => Promise<number>;
}

const counters: SessionCounters = {};
export function contributeSessionCounters(more: SessionCounters): void {
  Object.assign(counters, more);
}

export async function sessionUser(tx: Transaction, user: User): Promise<SessionUser> {
  const caterer = user.catererId ? await caterers(tx).get(user.catererId) : undefined;
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

/** GET /api/session: who is signed in, and what the shell must show (sign-in and manage-sessions designs). */
export async function sessionView(req: Request): Promise<Reply> {
  const user = req.locals['user'] as User | undefined;
  if (!user) {
    const view: SessionView = { user: null, unread: 0, queueCount: 0 };
    const pending = req.locals['pendingSecondFactor'] as User | undefined;
    if (pending) view.pendingSecondFactor = { email: pending.email, method: pending.secondFactor ?? 'authenticator app' };
    const expired = req.locals['expiredEmail'] as string | undefined;
    if (expired) view.expired = { email: expired };
    return ok(view);
  }
  const view: SessionView = {
    user: await sessionUser(req.tx, user),
    unread: user.role === 'Operator' ? 0 : ((await counters.unread?.(req.tx, user)) ?? 0),
    queueCount: user.role === 'Operator' ? ((await counters.queueCount?.(req.tx, req.now)) ?? 0) : 0,
  };
  if (await privacyUpdateRequired(req.tx, user)) view.privacyUpdateRequired = true;
  return ok(view);
}

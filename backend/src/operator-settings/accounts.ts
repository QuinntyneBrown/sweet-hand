import { randomUUID } from 'node:crypto';
import type { Request, Reply } from '../http/router.ts';
import { conflict, created, forbidden, invalid, notFound, ok } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { recordAudit } from '../platform/audit.ts';
import { queueEmail } from '../platform/outbox.ts';
import { randomToken, sha256 } from '../platform/secrets.ts';
import { sessions, users, type User } from '../identity/model.ts';
import type { AddOperatorRequest } from '@contract/add-operator-request.ts';
import type { AdminOnlyProblem } from '@contract/admin-only-problem.ts';
import type { OperatorAccount } from '@contract/operator-account.ts';
import { operatorActivity, operatorDeactivations, operatorInvitations, type OperatorInvitation } from './model.ts';
import { byName, tidy } from './text.ts';

/** manage-operator-accounts: only an Admin invites or deactivates operators (L2-056). */

const INVITATION_HOURS = 24;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]!.toUpperCase())
    .slice(0, 2)
    .join('');

const operatorUsers = async (tx: Transaction) => (await users(tx).find({ role: 'Operator' }));

/**
 * The refusal an operator without Admin gets from an Admin-only endpoint:
 * who to ask instead (L2-056.5). Other roles get the generic refusal, which
 * names nobody.
 */
export async function adminOnly(req: Request): Promise<Reply> {
  if (req.actor?.role !== 'Operator') return forbidden();
  const admins = (await operatorUsers(req.tx)).filter((u) => u.admin && !u.deleted).map((u) => u.displayName).sort((a, b) => a.localeCompare(b, 'en-CA'));
  const body: AdminOnlyProblem = { title: 'Only Admins can do this', admins };
  return { status: 403, body };
}

async function lastActive(tx: Transaction, userId: string): Promise<string | null> {
  const seen = (await sessions(tx).find({ userId })).map((s) => new Date(s.lastActiveAt).toISOString());
  const earlier = (await operatorActivity(tx).get(userId))?.lastActiveAt;
  return [...seen, ...(earlier ? [new Date(earlier).toISOString()] : [])].sort().at(-1) ?? null;
}

async function accountView(req: Request, user: User): Promise<OperatorAccount> {
  const deactivatedAt = (await operatorDeactivations(req.tx).get(user.id))?.at ?? null;
  const self = user.id === req.actor!.userId;
  return {
    id: user.id,
    name: user.displayName,
    initials: initialsOf(user.displayName),
    email: user.email,
    admin: !!user.admin,
    secondFactor: user.secondFactor ?? null,
    status: deactivatedAt ? 'Deactivated' : 'Active',
    lastActiveAt: self ? req.now.toISOString() : await lastActive(req.tx, user.id),
    deactivatedAt,
    self,
  };
}

const invitationView = (invite: OperatorInvitation): OperatorAccount => ({
  id: invite.id,
  name: invite.name,
  initials: initialsOf(invite.name),
  email: invite.email,
  admin: invite.admin,
  secondFactor: null,
  status: invite.deactivatedAt ? 'Deactivated' : 'Invited',
  invitedAt: invite.invitedAt,
  deactivatedAt: invite.deactivatedAt ?? null,
  self: false,
});

const RANK: Record<OperatorAccount['status'], number> = { Active: 0, Invited: 1, Deactivated: 2 };

/** Active operators, then invitations, then deactivated accounts; A to Z within each. */
export async function listOperators(req: Request): Promise<Reply> {
  const deactivated = new Set((await operatorDeactivations(req.tx).all()).map((d) => d.id));
  const team = (await operatorUsers(req.tx)).filter((u) => !u.deleted || deactivated.has(u.id));
  const all = [...(await Promise.all(team.map((u) => accountView(req, u)))), ...(await operatorInvitations(req.tx).all()).map(invitationView)];
  return ok(all.sort((a, b) => RANK[a.status] - RANK[b.status] || byName(a, b)));
}

/** Operators cannot sign up themselves; an Admin invites them by email (L2-056). */
export async function inviteOperator(req: Request): Promise<Reply> {
  const body = (req.body ?? {}) as Partial<AddOperatorRequest>;
  const name = tidy(body.name);
  const email = String(body.email ?? '').trim().toLowerCase();
  const errors: Record<string, string[]> = {};
  if (!name) errors['name'] = ['Enter their full name'];
  if (!email) errors['email'] = ['Enter their work email'];
  else if (!EMAIL.test(email)) errors['email'] = ['Enter an email address like name@example.com'];
  else if ((await users(req.tx).find({ emailKey: email })).some((u) => !u.deleted) || (await operatorInvitations(req.tx).findOne({ emailKey: email })))
    errors['email'] = ['This email already has a Sweet Hand account'];
  if (body.role !== 'operator' && body.role !== 'admin') errors['role'] = ['Choose a role'];
  if (Object.keys(errors).length) return invalid(errors);

  const token = randomToken();
  const invite: OperatorInvitation = {
    id: `op-${randomUUID()}`,
    name,
    email,
    emailKey: email,
    admin: body.role === 'admin',
    invitedAt: req.now.toISOString(),
    invitedBy: req.actor!.userId,
    tokenHash: sha256(token),
    expiresAt: new Date(req.now.getTime() + INVITATION_HOURS * 3600_000).toISOString(),
  };
  await operatorInvitations(req.tx).put(invite);
  await queueEmail(req.tx, req.now, { to: email, kind: 'operator-invitation', link: `/operator-invitations/${token}`, name, expiresAt: invite.expiresAt });
  await recordAudit(req.tx, req.now, {
    operatorId: req.actor!.userId,
    action: 'CreateOperator',
    targetType: 'operator',
    targetId: invite.id,
    reason: 'Invited to the operator team',
    before: null,
    after: invite.admin ? 'Admin' : 'Operator',
  });
  return created(invitationView(invite));
}

/** The operator's sessions end at once and they cannot sign in again (L2-056.4). */
export async function deactivateOperator(req: Request): Promise<Reply> {
  const id = req.params['id'];
  const me = req.actor!.userId;
  if (id === me) return conflict('You can’t deactivate your own account');
  const user = await users(req.tx).get(id);
  if (user && user.role === 'Operator') {
    if (!(await operatorDeactivations(req.tx).get(id))) {
      await operatorDeactivations(req.tx).put({ id, at: req.now.toISOString(), by: me });
      await users(req.tx).put({ ...user, deleted: true });
      for (const s of await sessions(req.tx).find({ userId: id })) await sessions(req.tx).delete(s.id);
      await recordAudit(req.tx, req.now, {
        operatorId: me,
        action: 'DeactivateOperator',
        targetType: 'operator',
        targetId: id,
        reason: 'Operator account deactivated',
        before: user.admin ? 'Admin' : 'Operator',
        after: 'Deactivated',
      });
    }
    return ok(await accountView(req, (await users(req.tx).get(id))!));
  }
  const invite = await operatorInvitations(req.tx).get(id);
  if (!invite) return notFound();
  if (invite.deactivatedAt) return ok(invitationView(invite));
  const done = { ...invite, deactivatedAt: req.now.toISOString() };
  await operatorInvitations(req.tx).put(done);
  await recordAudit(req.tx, req.now, { operatorId: me, action: 'DeactivateOperator', targetType: 'operator', targetId: id, reason: 'Operator account deactivated', before: 'Invited', after: 'Deactivated' });
  return ok(invitationView(done));
}

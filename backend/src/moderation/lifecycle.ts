/** Status changes operators make to caterer profiles (L2-046, L2-058), shared by decisions, records and reports. */
import { randomUUID } from 'node:crypto';
import type { Request } from '../http/router.ts';
import { conflict, fail, notFound } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { queueEmail } from '../platform/outbox.ts';
import { caterers, type Caterer, type ProfileStatus } from '../caterers/model.ts';
import { enquiries } from '../enquiries/model.ts';
import { liveUser } from '../identity/model.ts';
import { recordStatusChange, touchRecord, type StatusChange } from './model.ts';
import { findCaterer, ownerView } from './views.ts';
import type { DecisionResult } from '@contract/decision-result.ts';

/** The caterer an operator acts on; unknown ids are 404. */
export async function targetCaterer(req: Request): Promise<Caterer> {
  return (await findCaterer(req.tx, req.params['id'])) ?? fail(notFound());
}

/** 409 with the record's current status, so the page can say what changed (L2-046.2–3). */
export const stale = (c: Caterer) => fail(conflict('This profile changed', { status: c.status, name: c.name }));

/** Moves the profile to `status`, appending to its history (L2-046.4), and saves it with `changes`. */
export async function transition(
  req: Request,
  c: Caterer,
  status: ProfileStatus,
  step: StatusChange['step'],
  reason?: string,
  changes: Partial<Caterer> = {},
  extra: Partial<StatusChange> = {},
): Promise<Caterer> {
  await recordStatusChange(req.tx, req.now, { catererId: c.id, status, by: req.actor!.userId, step, ...(reason ? { reason } : {}), ...extra });
  const next: Caterer = { ...c, ...changes, status, statusChangedAt: req.now.toISOString() };
  await caterers(req.tx).put(next);
  await touchRecord(req.tx, c.id, req.now);
  return next;
}

/** Emails the caterer's owner. */
export async function emailOwner(req: Request, c: Caterer, kind: string, extra: Record<string, unknown> = {}): Promise<void> {
  const owner = await ownerView(req.tx, c);
  if (owner.email) await queueEmail(req.tx, req.now, { to: owner.email, kind, ...extra });
}

export async function decision(tx: Transaction, c: Caterer): Promise<DecisionResult> {
  return { id: c.id, name: c.name, slug: c.slug, status: c.status, owner: (await ownerView(tx, c)).name };
}

/** Closes the caterer's open and replied enquiries and tells each customer (L2-058.2). Returns how many closed. */
export async function closeOpenEnquiries(req: Request, c: Caterer): Promise<number> {
  const open = (await enquiries(req.tx).find({ catererId: c.id })).filter((e) => e.status === 'Open' || e.status === 'Replied');
  for (const e of open) {
    await enquiries(req.tx).put({ ...e, status: 'Closed', events: [...e.events, { id: randomUUID(), kind: 'closed', by: 'system', at: req.now.toISOString() }] });
    const customer = await liveUser(req.tx, e.customerId);
    if (customer) await queueEmail(req.tx, req.now, { to: customer.email, kind: 'caterer-unavailable', caterer: c.name });
  }
  return open.length;
}

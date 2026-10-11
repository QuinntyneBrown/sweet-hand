/** Suspend, reinstate and remove (suspend-reinstate-remove-profile design, L2-058, L2-046.3, L2-060). */
import { discardPhotoMedia } from '../caterer-profile/processing.ts';
import type { Request, Reply } from '../http/endpoint.ts';
import { fail, invalid, ok } from '../http/problems.ts';
import { recordAudit, type AuditEntry } from '../platform/audit.ts';
import type { Caterer } from '../caterers/model.ts';
import { closeOpenEnquiries, decision, emailOwner, stale, targetCaterer, transition } from './lifecycle.ts';
import { trimmed } from './views.ts';

export const reasonRequired = () => fail(invalid({ reason: ['Add a reason for this change'] }));

/** Hides a published caterer: its open enquiries close and their customers are told (L2-058.1–2). */
export async function suspendCaterer(req: Request, c: Caterer, reason: string): Promise<{ caterer: Caterer; entry: AuditEntry }> {
  if (c.status !== 'Published') stale(c);
  const closed = await closeOpenEnquiries(req, c);
  const caterer = await transition(req, c, 'Suspended', 'suspended', reason, { statusReason: reason }, { closedEnquiries: closed });
  const entry = await recordAudit(req, { operatorId: req.actor!.userId, action: 'Suspend', targetType: 'caterer', targetId: c.id, reason, before: { status: 'Published' }, after: { status: 'Suspended' } });
  await emailOwner(req, caterer, 'caterer-suspended', { reason });
  return { caterer, entry };
}

/** Removes a caterer for good, from any status but Removed (L2-058.4, L2-046.3). */
export async function removeCaterer(req: Request, c: Caterer, reason: string): Promise<{ caterer: Caterer; entry: AuditEntry }> {
  if (c.status === 'Removed') stale(c);
  await closeOpenEnquiries(req, c);
  const caterer = await transition(req, c, 'Removed', 'removed', reason, { statusReason: reason });
  // Its photos are no longer served (L2-058.4).
  for (const photo of c.photos) {
    await discardPhotoMedia(req, photo.file);
    if (photo.pendingFile) await discardPhotoMedia(req, photo.pendingFile);
  }
  const entry = await recordAudit(req, { operatorId: req.actor!.userId, action: 'Remove', targetType: 'caterer', targetId: c.id, reason, before: { status: c.status }, after: { status: 'Removed' } });
  await emailOwner(req, caterer, 'caterer-removed', { reason });
  return { caterer, entry };
}

const reasonOf = (req: Request) => trimmed(req.body?.reason);

/** POST /api/operator/profiles/:id/suspend */
export async function suspend(req: Request): Promise<Reply> {
  const c = await targetCaterer(req);
  const reason = reasonOf(req) || reasonRequired();
  return ok(await decision(req.tx, (await suspendCaterer(req, c, reason)).caterer));
}

/** POST /api/operator/profiles/:id/reinstate — enquiries closed by the suspension stay closed. */
export async function reinstate(req: Request): Promise<Reply> {
  const c = await targetCaterer(req);
  const reason = reasonOf(req) || reasonRequired();
  if (c.status !== 'Suspended') return stale(c);
  const caterer = await transition(req, c, 'Published', 'reinstated', reason, { statusReason: undefined });
  await recordAudit(req, { operatorId: req.actor!.userId, action: 'Reinstate', targetType: 'caterer', targetId: c.id, reason, before: { status: 'Suspended' }, after: { status: 'Published' } });
  await emailOwner(req, caterer, 'caterer-reinstated', { reason });
  return ok(await decision(req.tx, caterer));
}

/** POST /api/operator/profiles/:id/remove — needs a reason and the exact business name (L2-058.4). */
export async function remove(req: Request): Promise<Reply> {
  const c = await targetCaterer(req);
  const reason = reasonOf(req);
  const errors: Record<string, string[]> = {};
  if (!reason) errors['reason'] = ['Add a reason for this change'];
  if (req.body?.confirm !== c.name) errors['confirm'] = [`Type the business name exactly: ${c.name}`];
  if (Object.keys(errors).length) return invalid(errors);
  return ok(await decision(req.tx, (await removeCaterer(req, c, reason)).caterer));
}

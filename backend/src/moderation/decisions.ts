/** Approving or sending back a profile or a name change (decide-profile-approval design, L2-044, L2-046, L2-048, L2-060). */
import type { Request, Reply } from '../http/endpoint.ts';
import { fail, invalid, ok } from '../http/problems.ts';
import { recordAudit } from '../platform/audit.ts';
import { caterers, uniqueSlug, withAddressFor } from '../caterers/model.ts';
import { profileSnapshots, touchRecord } from './model.ts';
import { decision, emailOwner, stale, targetCaterer, transition } from './lifecycle.ts';
import { trimmed } from './views.ts';

/** A reason the caterer can act on: 10 characters or more (L2-048.2). */
function changeReason(body: unknown): string {
  const reason = trimmed((body as { reason?: unknown } | undefined)?.reason);
  if ([...reason].length < 10) fail(invalid({ reason: ['Explain what the caterer needs to change'] }));
  return reason;
}

/** POST /api/operator/profiles/:id/approve */
export async function approveProfile(req: Request): Promise<Reply> {
  const c = await targetCaterer(req);
  if (c.status !== 'Pending review') return stale(c);
  // The first publication takes its address from the name it is published under (L2-018.1).
  const address = c.publishedAt ? {} : { slug: await uniqueSlug(req.tx, c.name, c.id) };
  const next = await transition(req, c, 'Published', 'approved', undefined, { ...address, publishedAt: c.publishedAt ?? req.now.toISOString(), statusReason: undefined, attention: undefined });
  await recordAudit(req, { operatorId: req.actor!.userId, action: 'Approve', targetType: 'CatererProfile', targetId: c.id, reason: null, before: { status: 'Pending review' }, after: { status: 'Published' } });
  await emailOwner(req, next, 'profile-approved', { link: `/caterers/${next.slug}` });
  return ok(await decision(req.tx, next));
}

/** POST /api/operator/profiles/:id/request-changes — keeps a snapshot so the resubmission can show what changed (L2-047.3). */
export async function requestChanges(req: Request): Promise<Reply> {
  const c = await targetCaterer(req);
  const reason = changeReason(req.body);
  if (c.status !== 'Pending review') return stale(c);
  await profileSnapshots(req.tx).put({
    id: c.id,
    description: c.description,
    photoFiles: c.photos.map((p) => p.file),
    dishNames: c.dishes.map((d) => d.name),
    minGuests: c.minGuests,
    maxGuests: c.maxGuests,
    occasions: [...c.occasions],
    areas: [...c.areas],
    cuisines: [...c.cuisines],
  });
  const next = await transition(req, c, 'Changes requested', 'changes-requested', reason, { statusReason: reason });
  await recordAudit(req, { operatorId: req.actor!.userId, action: 'Request changes', targetType: 'CatererProfile', targetId: c.id, reason, before: { status: 'Pending review' }, after: { status: 'Changes requested' } });
  await emailOwner(req, next, 'changes-requested', { reason });
  return ok(await decision(req.tx, next));
}

/** POST /api/operator/profiles/:id/name/approve — the new name goes live and the old address redirects (L2-044.3, L2-018.3). */
export async function approveName(req: Request): Promise<Reply> {
  const c = await targetCaterer(req);
  if (!c.pendingName || c.status === 'Removed') return stale(c);
  const before = { name: c.name, slug: c.slug };
  const address = await withAddressFor(req.tx, c, c.pendingName);
  const slug = address.slug;
  const next = { ...c, name: c.pendingName, ...address, pendingName: undefined, pendingNameAt: undefined };
  await caterers(req.tx).put(next);
  await touchRecord(req.tx, c.id, req.now);
  await recordAudit(req, { operatorId: req.actor!.userId, action: 'Approve name change', targetType: 'CatererProfile', targetId: c.id, reason: null, before, after: { name: next.name, slug } });
  await emailOwner(req, next, 'name-approved', { link: `/caterers/${slug}` });
  return ok(await decision(req.tx, next));
}

/** POST /api/operator/profiles/:id/name/request-changes — the current name stays. */
export async function declineName(req: Request): Promise<Reply> {
  const c = await targetCaterer(req);
  const reason = changeReason(req.body);
  if (!c.pendingName) return stale(c);
  const next = { ...c, pendingName: undefined, pendingNameAt: undefined };
  await caterers(req.tx).put(next);
  await recordAudit(req, { operatorId: req.actor!.userId, action: 'Reject name change', targetType: 'CatererProfile', targetId: c.id, reason, before: { name: c.name, requested: c.pendingName }, after: { name: c.name } });
  await emailOwner(req, next, 'name-change-declined', { reason });
  return ok(await decision(req.tx, next));
}

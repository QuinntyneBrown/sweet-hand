/** The recent-changes feed (L2-047.4, L2-044.1) and Revert (L2-057.3). */
import { randomUUID } from 'node:crypto';
import type { Request, Reply } from '../http/endpoint.ts';
import { conflict, noContent, notFound, ok } from '../http/problems.ts';
import { recordAudit } from '../platform/audit.ts';
import { caterers, type Caterer } from '../caterers/model.ts';
import { ALL_AREAS, OCCASIONS } from '../discovery/taxonomy.ts';
import { profileEdits, touchRecord, type ProfileEdit } from './model.ts';
import { emailOwner } from './lifecycle.ts';
import { reasonRequired } from './status-actions.ts';
import { coverOf, DAY_MS, nameOf, ownerView, pageNumber, paginate, trimmed } from './views.ts';
import type { RecentChangeView } from '@contract/recent-change-view.ts';
import type { RecentChangesPageView } from '@contract/recent-changes-page-view.ts';

const FEED_DAYS = 30;

/** GET /api/operator/recent-changes?page= — the last 30 days, newest first. */
export async function recentChanges(req: Request): Promise<Reply> {
  const since = req.now.getTime() - FEED_DAYS * DAY_MS;
  const edits = (await profileEdits(req.tx).all()).filter((e) => Date.parse(e.at) >= since).sort((a, b) => Date.parse(b.at) - Date.parse(a.at) || b.seq - a.seq);
  const all: RecentChangeView[] = [];
  for (const e of edits) {
    const c = await caterers(req.tx).get(e.catererId);
    if (!c) continue;
    all.push({
      id: e.id,
      catererId: c.id,
      catererName: c.name,
      photo: coverOf(c),
      field: e.field,
      by: e.by ? await nameOf(req.tx, e.by) : (await ownerView(req.tx, c)).name,
      at: e.at,
      old: e.old,
      new: e.new,
      reverted: e.reverted ? { by: await nameOf(req.tx, e.reverted.by), at: e.reverted.at } : null,
    });
  }
  const view: RecentChangesPageView = paginate(all, pageNumber(req.query));
  return ok(view);
}

const idsOf = (names: string[], known: { id: string; name: string }[]) => names.map((n) => known.find((k) => k.name === n)?.id).filter((x): x is string => !!x);

/** The profile with the edit's old value written back, or null when the field moved on since (the design's open point: refuse). */
function reverted(c: Caterer, e: ProfileEdit): Caterer | null {
  const o = e.old;
  const n = e.new;
  switch (e.field) {
    case 'description':
      if (o?.kind !== 'text' || n?.kind !== 'text' || !c.description.includes(n.text)) return null;
      return { ...c, description: c.description.replace(n.text, o.text) };
    case 'guests':
      return o?.kind === 'guests' ? { ...c, minGuests: o.min, maxGuests: o.max } : null;
    case 'areas':
      return o?.kind === 'list' ? { ...c, areas: idsOf(o.items, ALL_AREAS) } : null;
    case 'occasions':
      return o?.kind === 'list' ? { ...c, occasions: idsOf(o.items, OCCASIONS) } : null;
    case 'menu': {
      if (n?.kind !== 'dish') return null;
      const added = c.dishes.find((d) => d.name === n.name);
      const dishes = c.dishes.filter((d) => d !== added);
      if (o?.kind === 'dish') dishes.push({ id: `${c.slug}-dish-${randomUUID()}`, name: o.name, tags: o.tags, price: o.price ?? undefined });
      return { ...c, dishes };
    }
    case 'cover-photo': {
      if (o?.kind !== 'photo') return null;
      const file = o.src.replace(/^\/media\//, '').replace(/\?.*$/, '');
      const existing = c.photos.find((p) => p.file === file);
      return { ...c, photos: [existing ?? { id: `${c.slug}-photo-${randomUUID()}`, file, caption: o.alt }, ...c.photos.filter((p) => p !== existing)] };
    }
    default:
      return null;
  }
}

/** POST /api/operator/recent-changes/:id/revert — { reason } */
export async function revertChange(req: Request): Promise<Reply> {
  const e = await profileEdits(req.tx).get(req.params['id']);
  const c = e && (await caterers(req.tx).get(e.catererId));
  if (!e || !c) return notFound();
  const reason = trimmed(req.body?.reason) || reasonRequired();
  if (e.reverted || c.status === 'Removed') return conflict('This change was already undone', { status: c.status, name: c.name });
  const next = reverted(c, e);
  if (!next) return conflict('The field changed again since', { status: c.status, name: c.name });
  await caterers(req.tx).put(next);
  await profileEdits(req.tx).put({ ...e, reverted: { by: req.actor!.userId, at: req.now.toISOString() } });
  await touchRecord(req.tx, c.id, req.now);
  await recordAudit(req, { operatorId: req.actor!.userId, action: 'Revert change', targetType: 'ProfileEdit', targetId: e.id, reason, before: { [e.field]: e.new }, after: { [e.field]: e.old } });
  await emailOwner(req, next, 'change-reverted', { reason });
  return noContent();
}

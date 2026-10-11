import type { Request } from '../http/router.ts';
import type { Dish, Photo } from '../caterers/model.ts';
import { recordProfileEdit } from '../moderation/model.ts';
import { areaName, occasionName } from '../discovery/taxonomy.ts';
import type { ChangedField } from '@contract/changed-field.ts';
import type { ChangeValue } from '@contract/change-value.ts';
import type { Own } from './own.ts';

/**
 * Edits to a Published profile go live at once and are added to the
 * operators' recent-changes feed with the old and new values (L2-044.1,
 * L2-047.4). Drafts are not in the feed, and a save that changes nothing adds
 * nothing.
 */
export async function recordLiveEdit(req: Request, own: Own, field: ChangedField, old: ChangeValue | null, now: ChangeValue | null): Promise<void> {
  if (own.caterer.status !== 'Published') return;
  if (JSON.stringify(old) === JSON.stringify(now)) return;
  await recordProfileEdit(req.tx, req.now, { catererId: own.caterer.id, field, by: own.user.id, old, new: now });
}

export const textValue = (text: string): ChangeValue => ({ kind: 'text', text });
export const guestsValue = (min: number, max: number): ChangeValue => ({ kind: 'guests', min, max });
export const areasValue = (ids: string[]): ChangeValue => ({ kind: 'list', items: ids.map(areaName) });
export const occasionsValue = (ids: string[]): ChangeValue => ({ kind: 'list', items: ids.map(occasionName) });
export const dishValue = (d: Dish): ChangeValue => ({ kind: 'dish', name: d.name, price: d.price ?? null, tags: [...d.tags] });
export const photoValue = (p: Photo): ChangeValue => ({ kind: 'photo', src: `/media/${p.file}?w=400&fm=jpeg`, alt: p.caption });

/** Records a change of cover photo (photo 1) after a photo operation (L2-042.6). */
export async function recordCoverChange(req: Request, own: Own, before: Photo | undefined): Promise<void> {
  const after = own.caterer.photos[0];
  if (before?.id === after?.id && before?.file === after?.file) return;
  await recordLiveEdit(req, own, 'cover-photo', before ? photoValue(before) : null, after ? photoValue(after) : null);
}

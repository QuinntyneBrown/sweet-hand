/** Operator edits to a caterer's profile, each with a reason (edit-profile-as-operator design, L2-057, L2-060). */
import { discardPhotoMedia } from '../caterer-profile/processing.ts';
import type { Request, Reply } from '../http/endpoint.ts';
import { invalid, notFound, ok } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { recordAudit } from '../platform/audit.ts';
import { torontoDate } from '../discovery/listing.ts';
import { ALL_AREAS, allCuisines, OCCASIONS } from '../discovery/taxonomy.ts';
import { caterers, withAddressFor, type Caterer, type Photo } from '../caterers/model.ts';
import { touchRecord } from './model.ts';
import { emailOwner, stale, targetCaterer } from './lifecycle.ts';
import { catererRecord } from './records.ts';
import { reasonRequired } from './status-actions.ts';
import { DAY_MS, trimmed } from './views.ts';
import type { EditableField } from '@contract/editable-field.ts';
import type { RemoveItemResult } from '@contract/remove-item-result.ts';

/** The publish minimums of L2-039 that an operator removal may break (L2-057.2). */
const MIN_PHOTOS = 3;
const MIN_DISHES = 3;
const REPLACE_WITHIN_DAYS = 14;

type Edit = { next: Caterer; before: unknown; after: unknown } | { errors: Record<string, string[]> };

const same = (a: string, b: string) => a.toLocaleLowerCase('en-CA') === b.toLocaleLowerCase('en-CA');

/** Validates one field with the rules the caterer's editor uses, and works out the new profile. */
async function editField(tx: Transaction, c: Caterer, field: EditableField, value: unknown): Promise<Edit> {
  switch (field) {
    case 'name': {
      const name = trimmed(value);
      if (!name) return { errors: { value: ['Enter the business name'] } };
      const before = { name: c.name, slug: c.slug };
      if (name === c.name) return { next: c, before, after: before };
      const address = await withAddressFor(tx, c, name);
      return { next: { ...c, name, ...address }, before, after: { name, slug: address.slug } };
    }
    case 'description': {
      const text = trimmed(value);
      const n = [...text].length;
      if (n < 50 || n > 2000) return { errors: { value: ['Write 50 to 2,000 characters'] } };
      return { next: { ...c, description: text }, before: { description: c.description }, after: { description: text } };
    }
    case 'guests': {
      const v = (value ?? {}) as { min?: unknown; max?: unknown };
      const min = Number(v.min);
      const max = Number(v.max);
      if (!Number.isInteger(min) || min < 1) return { errors: { min: ['Enter the fewest guests as a whole number'] } };
      if (!Number.isInteger(max) || max < min) return { errors: { max: ['Make the most guests at least the fewest'] } };
      return { next: { ...c, minGuests: min, maxGuests: max }, before: { minGuests: c.minGuests, maxGuests: c.maxGuests }, after: { minGuests: min, maxGuests: max } };
    }
    case 'cuisines':
    case 'areas':
    case 'occasions': {
      const names = (Array.isArray(value) ? value : String(value ?? '').split(',')).map((x) => String(x).trim()).filter(Boolean);
      const known: { id: string; name: string }[] = field === 'cuisines' ? (await allCuisines(tx)).filter((x) => !x.retired) : field === 'areas' ? ALL_AREAS : OCCASIONS;
      const listName = field === 'cuisines' ? 'cuisine' : field === 'areas' ? 'service area' : 'occasion';
      if (!names.length) return { errors: { value: [`Choose at least one ${listName}`] } };
      const unknown = names.find((n) => !known.some((k) => same(k.name, n)));
      if (unknown) return { errors: { value: [`“${unknown}” isn’t on the ${listName} list`] } };
      if (field === 'cuisines' && names.length > 5) return { errors: { value: ['Choose up to 5 cuisines'] } };
      const ids = [...new Set(names.map((n) => known.find((k) => same(k.name, n))!.id))];
      return { next: { ...c, [field]: ids }, before: { [field]: [...c[field]] }, after: { [field]: ids } };
    }
    default:
      return { errors: { field: ['Choose a field'] } };
  }
}

/** PATCH /api/operator/profiles/:id — { field, value, reason }; live straight away, the caterer is emailed the reason (L2-057.1). */
export async function editProfile(req: Request): Promise<Reply> {
  const c = await targetCaterer(req);
  const reason = trimmed(req.body?.reason);
  if (c.status === 'Removed') return stale(c);
  const result = await editField(req.tx, c, req.body?.field as EditableField, req.body?.value);
  if ('errors' in result) return invalid(reason ? result.errors : { ...result.errors, reason: ['Add a reason for this change'] });
  if (!reason) return reasonRequired();
  await caterers(req.tx).put(result.next);
  await touchRecord(req.tx, c.id, req.now);
  await recordAudit(req, { operatorId: req.actor!.userId, action: 'Edit', targetType: 'CatererProfile', targetId: c.id, reason, before: result.before, after: result.after });
  await emailOwner(req, result.next, 'operator-edit', { reason });
  return ok(await catererRecord(req.tx, req.now, result.next));
}

/** DELETE …/photos/:item and …/menu-items/:item — goes ahead below the minimums, with 14 days to replace (L2-057.2). */
const removeItem =
  (kind: 'photo' | 'dish') =>
  async (req: Request): Promise<Reply> => {
    const c = await targetCaterer(req);
    const reason = trimmed(req.body?.reason) || reasonRequired();
    if (c.status === 'Removed') return stale(c);
    const list: { id: string }[] = kind === 'photo' ? c.photos : c.dishes;
    const item = list.find((x) => x.id === req.params['item']);
    if (!item) return notFound();
    const next: Caterer = kind === 'photo' ? { ...c, photos: c.photos.filter((p) => p !== item) } : { ...c, dishes: c.dishes.filter((d) => d !== item) };
    const short = kind === 'photo' ? next.photos.length < MIN_PHOTOS : next.dishes.length < MIN_DISHES;
    const replaceBy = short ? torontoDate(new Date(req.now.getTime() + REPLACE_WITHIN_DAYS * DAY_MS)) : null;
    await caterers(req.tx).put(next);
    // A removed photo is no longer served (edit-profile-as-operator design).
    if (kind === 'photo') await discardPhotoMedia(req, (item as Photo).file);
    await touchRecord(req.tx, c.id, req.now);
    await recordAudit(req, { operatorId: req.actor!.userId, action: kind === 'photo' ? 'Remove photo' : 'Remove dish', targetType: 'CatererProfile', targetId: c.id, reason, before: { [kind]: item }, after: null });
    await emailOwner(req, next, kind === 'photo' ? 'operator-removed-photo' : 'operator-removed-dish', { reason, ...(replaceBy ? { replaceBy } : {}) });
    const view: RemoveItemResult = { replaceBy };
    return ok(view);
  };

export const removePhoto = removeItem('photo');
export const removeDish = removeItem('dish');

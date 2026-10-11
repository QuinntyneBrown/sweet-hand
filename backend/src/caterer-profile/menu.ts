import { randomUUID } from 'node:crypto';
import type { Reply, Request } from '../http/router.ts';
import { badRequest, conflict, fail, invalid, notFound } from '../http/problems.ts';
import type { Dish } from '../caterers/model.ts';
import { DIETARY_TAGS } from '../discovery/taxonomy.ts';
import { assertEditable, loadOwn, reorder, saveCaterer, text, type Own } from './own.ts';
import { dishValue, recordLiveEdit } from './live-edits.ts';
import { ownProfileReply } from './profile.ts';
import { MAX_DISHES, MIN_PUBLISHED } from './view.ts';

const TAG_IDS = DIETARY_TAGS.map((t) => t.id);

/** A dish from the request: name 2–80, description up to 300, price up to 60, tags from the fixed list (L2-043, L2-017.3). */
function dishFrom(body: any, id: string): Dish {
  const tags: unknown[] = Array.isArray(body?.tags) ? body.tags : [];
  if (tags.some((t) => typeof t !== 'string' || !TAG_IDS.includes(t))) fail(badRequest('Unknown dietary tag'));
  const name = text(body?.name);
  const description = text(body?.description);
  const price = text(body?.price);
  const errors: Record<string, string[]> = {};
  if (name.length < 2 || name.length > 80) errors['name'] = ['Dish names are 2–80 characters'];
  if (description.length > 300) errors['description'] = ['Keep the description to 300 characters'];
  if (price.length > 60) errors['price'] = ['Keep price guidance to 60 characters'];
  if (Object.keys(errors).length) fail(invalid(errors));
  return { id, name, tags: TAG_IDS.filter((t) => tags.includes(t)), ...(description ? { description } : {}), ...(price ? { price } : {}) };
}

async function editableOwn(req: Request): Promise<Own> {
  const own = await loadOwn(req);
  assertEditable(own.caterer);
  return own;
}

function indexOf(own: Own, id: string): number {
  const index = own.caterer.dishes.findIndex((d) => d.id === id);
  return index < 0 ? fail(notFound()) : index;
}

export async function addDish(req: Request): Promise<Reply> {
  const own = await editableOwn(req);
  if (own.caterer.dishes.length >= MAX_DISHES) return conflict('You can list up to 50 dishes');
  const dish = dishFrom(req.body, `dish-${randomUUID()}`);
  own.caterer.dishes.push(dish);
  await recordLiveEdit(req, own, 'menu', null, dishValue(dish));
  await saveCaterer(req, own.caterer);
  return ownProfileReply(req, own, 201);
}

export async function updateDish(req: Request): Promise<Reply> {
  const own = await editableOwn(req);
  const index = indexOf(own, req.params['id']);
  const before = own.caterer.dishes[index];
  const dish = dishFrom(req.body, before.id);
  own.caterer.dishes[index] = dish;
  await recordLiveEdit(req, own, 'menu', dishValue(before), dishValue(dish));
  await saveCaterer(req, own.caterer);
  return ownProfileReply(req, own);
}

export async function removeDish(req: Request): Promise<Reply> {
  const own = await editableOwn(req);
  const index = indexOf(own, req.params['id']);
  if (own.caterer.status === 'Published' && own.caterer.dishes.length <= MIN_PUBLISHED) return conflict('Published profiles need at least 3 dishes');
  const [dish] = own.caterer.dishes.splice(index, 1);
  await recordLiveEdit(req, own, 'menu', dishValue(dish), null);
  await saveCaterer(req, own.caterer);
  return ownProfileReply(req, own);
}

export async function reorderDishes(req: Request): Promise<Reply> {
  const own = await editableOwn(req);
  const next = reorder(own.caterer.dishes, req.body?.dishIds);
  if (!next) return badRequest('Send every dish id once');
  own.caterer.dishes = next;
  await saveCaterer(req, own.caterer);
  return ownProfileReply(req, own);
}

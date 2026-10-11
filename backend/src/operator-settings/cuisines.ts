import type { Request, Reply } from '../http/endpoint.ts';
import { created, invalid, notFound, ok } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { recordAudit } from '../platform/audit.ts';
import { caterers, slugify, type Caterer } from '../caterers/model.ts';
import { users } from '../identity/model.ts';
import { allCuisines, cuisines, type Cuisine } from '../discovery/taxonomy.ts';
import type { AddCuisineRequest } from '@contract/add-cuisine-request.ts';
import type { CuisineUsage } from '@contract/cuisine-usage.ts';
import type { OperatorCuisine } from '@contract/operator-cuisine.ts';
import { byName, fold, tidy } from './text.ts';

/** manage-cuisine-list: operators add and retire cuisines (L2-007.4, L2-007.5). */

async function cuisineView(tx: Transaction, c: Cuisine, published: Caterer[]): Promise<OperatorCuisine> {
  const adder = c.addedBy ? await users(tx).get(c.addedBy) : undefined;
  return {
    id: c.id,
    name: c.name,
    retired: c.retired,
    addedAt: c.addedAt,
    addedBy: adder?.displayName ?? null,
    retiredAt: c.retiredAt ?? null,
    publishedCaterers: published.filter((x) => x.cuisines.includes(c.id)).length,
  };
}

const publishedCaterers = (tx: Transaction) => caterers(tx).find({ status: 'Published' });

async function usage(tx: Transaction, cuisine: Cuisine): Promise<CuisineUsage> {
  const published = await publishedCaterers(tx);
  return {
    cuisine: await cuisineView(tx, cuisine, published),
    caterers: published
      .filter((x) => x.cuisines.includes(cuisine.id))
      .sort(byName)
      .map((x) => ({ name: x.name, slug: x.slug, photo: `/media/${x.photos[0]?.file ?? 'pelau-house.jpg'}?w=400&fm=jpeg` })),
  };
}

/** Every cuisine, retired ones included, A to Z. */
export async function listCuisines(req: Request): Promise<Reply> {
  const published = await publishedCaterers(req.tx);
  const all = (await allCuisines(req.tx)).sort(byName);
  return ok(await Promise.all(all.map((c) => cuisineView(req.tx, c, published))));
}

/** A new cuisine is selectable and offered by the filter straight away (L2-007.4). */
export async function addCuisine(req: Request): Promise<Reply> {
  const name = tidy((req.body as Partial<AddCuisineRequest> | undefined)?.name);
  if (!name) return invalid({ name: ['Enter a cuisine name'] });
  if (name.length < 2 || name.length > 40) return invalid({ name: ['Use 2 to 40 characters'] });
  const all = await allCuisines(req.tx);
  const id = slugify(name);
  const existing = all.find((c) => fold(c.name) === fold(name) || c.id === id);
  if (existing) return invalid({ name: [`${existing.name} is already on the list`] });
  const operatorId = req.actor!.userId;
  const cuisine: Cuisine = {
    id,
    name,
    retired: false,
    addedAt: req.now.toISOString(),
    position: Math.max(-1, ...all.map((c) => c.position)) + 1,
    addedBy: operatorId,
  };
  await cuisines(req.tx).put(cuisine);
  await recordAudit(req.tx, req.now, { operatorId, action: 'AddCuisine', targetType: 'cuisine', targetId: id, reason: 'Added to the cuisine list', before: null, after: name });
  return created(await cuisineView(req.tx, cuisine, await publishedCaterers(req.tx)));
}

/** The published caterers that use a cuisine, for the retire warning (L2-007.5). */
export async function cuisineUsage(req: Request): Promise<Reply> {
  const cuisine = await cuisines(req.tx).get(req.params['id']);
  return cuisine ? ok(await usage(req.tx, cuisine)) : notFound();
}

/** Retiring is permanent and idempotent; caterers who use it keep it (L2-007.5). */
export async function retireCuisine(req: Request): Promise<Reply> {
  let cuisine = await cuisines(req.tx).get(req.params['id']);
  if (!cuisine) return notFound();
  if (!cuisine.retired) {
    cuisine = { ...cuisine, retired: true, retiredAt: req.now.toISOString() };
    await cuisines(req.tx).put(cuisine);
    await recordAudit(req.tx, req.now, {
      operatorId: req.actor!.userId,
      action: 'RetireCuisine',
      targetType: 'cuisine',
      targetId: cuisine.id,
      reason: 'Retired from the cuisine list',
      before: 'Active',
      after: 'Retired',
    });
  }
  return ok(await usage(req.tx, cuisine));
}

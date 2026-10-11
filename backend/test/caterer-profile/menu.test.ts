import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi, type Api } from '../support/api.ts';
import type { Caterer } from '../../src/caterers/model.ts';
import { CAST_NOW } from '../../src/platform/clock.ts';

const KENDRA = 'kendra@pelauhouse.example';

const caterer = async (api: Api, id: string) => (await documents<Caterer>(api, 'caterers')).find((c) => c.id === id)!;
const edits = async (api: Api, catererId: string) => (await documents(api, 'profileEdits')).filter((e) => e.catererId === catererId && e.at >= CAST_NOW).sort((a, b) => a.seq - b.seq);

const PEPPERPOT = { name: ' Pepperpot ', description: 'Cassareep, beef and pork, cooked down slow.', tags: ['gluten-free', 'spicy'], price: 'From $20 per person' };

describe('menu items (manage-menu design, L2-043)', () => {
  it('Given a caterer adds "Pepperpot" with a description, when saved, then it is added at the end of the menu with its tags in list order (L2-043.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.post('/api/caterer/profile/menu-items', { ...PEPPERPOT, tags: ['spicy', 'gluten-free'] });

    assert.equal(res.status, 201);
    const last = res.body.dishes.at(-1);
    assert.equal(res.body.dishes.length, 19);
    assert.deepEqual({ ...last, id: undefined }, { id: undefined, name: 'Pepperpot', description: 'Cassareep, beef and pork, cooked down slow.', tags: ['gluten-free', 'spicy'], price: 'From $20 per person' });
    assert.equal((await caterer(api, 'cat-001')).dishes.at(-1)!.id, last.id);
  });

  it('Given an empty description and price, when a dish is saved, then they are left out', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    await kendra.post('/api/caterer/profile/menu-items', { name: 'Sahina', description: '  ', tags: [], price: '' });

    const dish = (await caterer(api, 'cat-001')).dishes.at(-1)!;
    assert.equal(dish.name, 'Sahina');
    assert.ok(!('description' in dish) && !('price' in dish));
  });

  it('Given a name of 1 or 81 characters, a description over 300 and price over 60, when saved, then each is refused inline (L2-043.4)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const one = await kendra.post('/api/caterer/profile/menu-items', { name: 'P', description: '', tags: [], price: '' });
    const long = await kendra.post('/api/caterer/profile/menu-items', { name: 'P'.repeat(81), description: 'd'.repeat(301), tags: [], price: 'p'.repeat(61) });

    assert.equal(one.status, 400);
    assert.deepEqual(one.body.errors, { name: ['Dish names are 2–80 characters'] });
    assert.deepEqual(long.body.errors, {
      name: ['Dish names are 2–80 characters'],
      description: ['Keep the description to 300 characters'],
      price: ['Keep price guidance to 60 characters'],
    });
    assert.equal((await caterer(api, 'cat-001')).dishes.length, 18);
  });

  it('Given a tag off the fixed list, when saved, then it is a bad request (L2-017.3)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.post('/api/caterer/profile/menu-items', { ...PEPPERPOT, tags: ['keto'] });

    assert.equal(res.status, 400);
    assert.equal(res.body.title, 'Unknown dietary tag');
  });

  it('Given a caterer with 50 dishes, when they add another, then it is refused (L2-043.3)', async () => {
    const api = await startApi();
    const vishnu = await signedInClient(api, 'vishnu@maracasbay.example');

    const res = await vishnu.post('/api/caterer/profile/menu-items', PEPPERPOT);

    assert.equal(res.status, 409);
    assert.equal(res.body.title, 'You can list up to 50 dishes');
  });

  it('Given a dish, when it is edited, then it keeps its id and place', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.put('/api/caterer/profile/menu-items/pelau-house-dish-2', { name: 'Curry goat', description: '', tags: ['halal'], price: 'From $19 per person' });

    assert.equal(res.status, 200);
    assert.deepEqual((await caterer(api, 'cat-001')).dishes[1], { id: 'pelau-house-dish-2', name: 'Curry goat', tags: ['halal'], price: 'From $19 per person' });
  });

  it('Given every dish id once, when the menu is reordered, then the order is saved; a list that misses one is refused', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const ids = (await caterer(api, 'cat-001')).dishes.map((d) => d.id);
    const reordered = [ids[2], ids[0], ids[1], ...ids.slice(3)];

    assert.equal((await kendra.put('/api/caterer/profile/menu-items/order', { dishIds: ids.slice(1) })).status, 400);
    assert.equal((await kendra.put('/api/caterer/profile/menu-items/order', { dishIds: [ids[0], ...ids.slice(0, -1)] })).status, 400);
    const res = await kendra.put('/api/caterer/profile/menu-items/order', { dishIds: reordered });

    assert.equal(res.status, 200);
    assert.deepEqual((await caterer(api, 'cat-001')).dishes.map((d) => d.id), reordered);
  });

  it('Given a dish, when it is removed, then it leaves the menu', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.delete('/api/caterer/profile/menu-items/pelau-house-dish-6');

    assert.equal(res.status, 200);
    assert.ok(!(await caterer(api, 'cat-001')).dishes.some((d) => d.id === 'pelau-house-dish-6'));
  });

  it('Given a published caterer with 3 dishes, when they remove one, then it is refused (L2-043.2)', async () => {
    const api = await startApi();
    const paulette = await signedInClient(api, 'paulette@blackcakeco.example');

    const res = await paulette.delete('/api/caterer/profile/menu-items/black-cake-co-dish-1');

    assert.equal(res.status, 409);
    assert.equal(res.body.title, 'Published profiles need at least 3 dishes');
    assert.equal((await caterer(api, 'cat-005')).dishes.length, 3);
  });

  it('Given another caterer’s dish, when Kendra edits or removes it, then it is not found and unchanged (L2-079.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    assert.equal((await kendra.put('/api/caterer/profile/menu-items/black-cake-co-dish-1', PEPPERPOT)).status, 404);
    assert.equal((await kendra.delete('/api/caterer/profile/menu-items/black-cake-co-dish-1')).status, 404);
    assert.equal((await caterer(api, 'cat-005')).dishes[0].name, 'Black cake');
  });

  it('Given a published profile, when a dish is added, edited and removed, then each is in the recent-changes feed (L2-044.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    await kendra.post('/api/caterer/profile/menu-items', PEPPERPOT);
    await kendra.put('/api/caterer/profile/menu-items/pelau-house-dish-6', { name: 'Aloo pie', description: '', tags: ['vegan'], price: '$3 each' });
    await kendra.delete('/api/caterer/profile/menu-items/pelau-house-dish-3');

    const pepperpot = { kind: 'dish', name: 'Pepperpot', price: 'From $20 per person', tags: ['gluten-free', 'spicy'] };
    assert.deepEqual(
      (await edits(api, 'cat-001')).map((e) => [e.field, e.old, e.new]),
      [
        ['menu', null, pepperpot],
        ['menu', { kind: 'dish', name: 'Aloo pie', price: null, tags: ['vegan'] }, { kind: 'dish', name: 'Aloo pie', price: '$3 each', tags: ['vegan'] }],
        ['menu', { kind: 'dish', name: 'Macaroni pie', price: 'From $6 per person', tags: ['vegetarian'] }, null],
      ],
    );
  });
});

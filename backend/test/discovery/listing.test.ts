import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startApi } from '../support/api.ts';
import { caterers } from '../../src/caterers/model.ts';

const DAY = 24 * 60 * 60_000;

describe('caterer listing (L2-001, L2-002, L2-003, L2-008, L2-011)', async () => {
  const api = await startApi();
  const get = (query = '') => api.client().get(`/api/public/caterers${query}`);

  it('Given 60 published caterers among others, when a visitor opens the listing, then only published caterers are counted', async () => {
    const res = await get();
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 60);
    const published = await api.env.db.transaction(async (tx) => (await caterers(tx).find({ status: 'Published' })).map((c) => c.slug));
    for (const item of res.body.items) assert.ok(published.includes(item.slug));
  });

  it('Given 60 published caterers, when the visitor walks pages 1 to 3, then they hold 24, 24 and 12 and every caterer appears once', async () => {
    const pages = await Promise.all([1, 2, 3].map((p) => get(`?page=${p}`)));
    assert.deepEqual(pages.map((p) => p.body.items.length), [24, 24, 12]);
    assert.deepEqual(pages.map((p) => [p.body.page, p.body.pageSize, p.body.pageCount]), [[1, 24, 3], [2, 24, 3], [3, 24, 3]]);
    assert.equal(new Set(pages.flatMap((p) => p.body.items.map((i: { slug: string }) => i.slug))).size, 60);
  });

  it('Given a page past the end, zero, negative or not a whole number, when it is requested, then page 1 is shown without an error', async () => {
    const first = (await get()).body.items[0].slug;
    for (const page of ['4', '0', '-1', '1.5', 'abc']) {
      const res = await get(`?page=${page}`);
      assert.equal(res.status, 200);
      assert.equal(res.body.page, 1);
      assert.equal(res.body.items[0].slug, first);
    }
  });

  it('Given a card, when it is listed, then it carries the name, primary cuisine and area, and a cover photo with its caption', async () => {
    const pelau = (await get()).body.items.find((i: { slug: string }) => i.slug === 'pelau-house');
    assert.equal(pelau.name, 'Pelau House');
    assert.equal(pelau.primaryCuisine, 'Trinidadian & Tobagonian');
    assert.equal(pelau.primaryArea, 'Scarborough');
    assert.equal(pelau.cover.alt, 'Chicken pelau in a steel pot with lime and cucumber chutney');
    assert.equal(pelau.cover.src, '/media/pelau-house.jpg?w=800&fm=jpeg');
    assert.match(pelau.cover.srcset, /\/media\/pelau-house\.jpg\?w=400&fm=avif 400w/);
  });

  it('Given the cuisine filter Jamaican, when the listing loads, then only Jamaican caterers appear and the facets recount', async () => {
    const res = await get('?cuisine=jamaican');
    assert.ok(res.body.total > 0 && res.body.total < 60);
    for (const item of res.body.items) assert.equal(item.primaryCuisine, 'Jamaican');
    const jamaican = res.body.cuisines.find((c: { id: string }) => c.id === 'jamaican');
    assert.equal(jamaican.count, res.body.total);
  });

  it('Given an unknown filter value, when the listing loads, then it is ignored and valid filters still apply (L2-003.3)', async () => {
    const valid = await get('?cuisine=jamaican');
    const mixed = await get('?cuisine=jamaican&cuisine=atlantis&region=narnia&occasion=moon-landing');
    assert.equal(mixed.status, 200);
    assert.equal(mixed.body.total, valid.body.total);
  });

  it('Given a region, when the listing is filtered by it, then caterers serving any of its areas appear', async () => {
    const durham = await get('?region=durham');
    const ajax = await get('?area=ajax');
    assert.ok(durham.body.total >= ajax.body.total);
    const facet = durham.body.regions.find((r: { id: string }) => r.id === 'durham');
    assert.equal(facet.count, durham.body.total);
    assert.deepEqual(durham.body.regions.map((r: { id: string }) => r.id), ['city-of-toronto', 'peel', 'york-region', 'durham', 'halton']);
  });

  it('Given an occasion, when the listing is filtered by it, then only caterers taking that occasion appear', async () => {
    const res = await get('?occasion=private-dinners');
    assert.equal(res.body.total, res.body.occasions.find((o: { id: string }) => o.id === 'private-dinners').count);
    assert.equal(res.body.occasions.length, 8);
  });

  it('Given no caterer matches, when the listing loads, then it is an empty page, not an error (L2-001.4)', async () => {
    const res = await get('?cuisine=cuban');
    assert.equal(res.status, 200);
    assert.deepEqual([res.body.total, res.body.items.length, res.body.page, res.body.pageCount], [0, 0, 1, 1]);
  });

  it('Given the same filters on one date, when the listing is asked for twice, then the order is the same; on another date it differs (L2-002.3, L2-002.4)', async () => {
    api.env.clock.set('2026-10-12T14:00:00.000Z');
    const a = (await get()).body.items.map((i: { slug: string }) => i.slug);
    const b = (await get()).body.items.map((i: { slug: string }) => i.slug);
    assert.deepEqual(a, b);
    api.env.clock.advance(DAY);
    const c = (await get()).body.items.map((i: { slug: string }) => i.slug);
    assert.notDeepEqual(a, c);
    api.env.clock.set('2026-10-10T14:00:00.000Z');
  });
});

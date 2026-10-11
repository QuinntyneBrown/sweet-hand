import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startApi } from '../support/api.ts';
import { caterers } from '../../src/caterers/model.ts';

describe('caterer page (L2-013, L2-014, L2-015, L2-018)', async () => {
  const api = await startApi();

  it('Given a published caterer, when a visitor opens its page, then they get the allow-listed public view', async () => {
    const res = await api.client().get('/api/public/caterers/pelau-house');
    assert.equal(res.status, 200);
    assert.deepEqual(Object.keys(res.body).sort(), ['cuisines', 'description', 'dishes', 'maxGuests', 'minGuests', 'name', 'occasions', 'photos', 'rating', 'regions', 'slug']);
    assert.deepEqual(res.body.cuisines, ['Trinidadian & Tobagonian', 'Guyanese']);
    assert.equal(res.body.rating.count, 23);
    assert.equal(Math.round(res.body.rating.average * 10) / 10, 4.7);
    assert.deepEqual(res.body.regions, [
      { name: 'City of Toronto', areas: ['Scarborough', 'East York', 'North York'] },
      { name: 'Durham', areas: ['Pickering', 'Ajax'] },
    ]);
    assert.equal(res.body.photos[0].viewerSrc, '/media/pelau-house.jpg?w=1200&fm=jpeg');
    assert.deepEqual(res.body.dishes[0], { name: 'Chicken pelau', description: 'Browned in burnt sugar, cooked down with pigeon peas, rice and coconut milk.', price: 'From $16 per person', tags: ['gluten-free', 'dairy-free'] });
    assert.equal(JSON.stringify(res.body).includes('hello@pelauhouse.example'), false, 'no contact details (L2-014)');
    assert.equal(JSON.stringify(res.body).includes('FH-2024-118734'), false, 'no certificate');
  });

  it('Given a draft, pending, suspended or unknown caterer, when its page is opened, then the answer is the same 404 (L2-014.2)', async () => {
    const bodies = [];
    for (const slug of ['callaloo-corner', 'auntie-bevs-kitchen', 'hibiscus-hut', 'no-such-caterer']) {
      const res = await api.client().get(`/api/public/caterers/${slug}`);
      assert.equal(res.status, 404, slug);
      bodies.push(res.body);
    }
    assert.equal(new Set(bodies.map((b) => JSON.stringify(b))).size, 1);
  });

  it('Given a removed caterer, when its page is opened, then it is gone, with the number of published caterers (L2-018.5)', async () => {
    const res = await api.client().get('/api/public/caterers/coal-pot-kitchen');
    assert.equal(res.status, 410);
    assert.deepEqual(res.body, { title: 'Gone', publishedCount: 60 });
  });

  it('Given a caterer that was renamed, when the old address is opened, then it redirects permanently to the new one (L2-018.3)', async () => {
    await api.env.db.transaction(async (tx) => {
      const c = (await caterers(tx).findOne({ slug: 'cou-cou' }))!;
      await caterers(tx).put({ ...c, slug: 'cou-cou-and-flying-fish', name: 'Cou-Cou & Flying Fish', previousSlugs: ['cou-cou'] });
    });
    const res = await api.client().get('/api/public/caterers/cou-cou');
    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), '/api/public/caterers/cou-cou-and-flying-fish');
  });
});

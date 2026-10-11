import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startApi } from '../support/api.ts';
import { cuisines } from '../../src/discovery/taxonomy.ts';

describe('taxonomy and lookups (L2-007, L2-010, L2-012, L2-021)', async () => {
  const api = await startApi();

  it('Given the service-area model, when it is asked for, then every area comes with its region', async () => {
    const res = await api.client().get('/api/public/service-areas');
    assert.equal(res.body.length, 30);
    assert.deepEqual(res.body[0], { id: 'downtown-toronto', name: 'Downtown Toronto', regionId: 'city-of-toronto', regionName: 'City of Toronto' });
  });

  it('Given an operator adds "Caymanian", when the cuisine list is asked for, then the active cuisines come A to Z (L2-007.1, manage-cuisine-list CuisineCatalogue)', async () => {
    const fresh = await startApi();
    await fresh.env.db.transaction((tx) => cuisines(tx).put({ id: 'caymanian', name: 'Caymanian', retired: false, addedAt: '2026-10-10T14:00:00.000Z', position: 18 }));
    const names = (await fresh.client().get('/api/public/cuisines')).body.map((c: { name: string }) => c.name);
    assert.deepEqual(names, [...names].sort((a: string, b: string) => a.localeCompare(b, 'en-CA')));
    assert.deepEqual(names.slice(3, 6), ['Belizean', 'Caymanian', 'Cuban']);
  });

  it('Given a retired cuisine, when the cuisine list is asked for, then it is left out', async () => {
    await api.env.db.transaction(async (tx) => {
      const cuban = (await cuisines(tx).get('cuban'))!;
      await cuisines(tx).put({ ...cuban, retired: true });
    });
    const res = await api.client().get('/api/public/cuisines');
    assert.equal(res.body.length, 17);
    assert.deepEqual(res.body[0], { id: 'antiguan-and-barbudan', name: 'Antiguan & Barbudan' });
    assert.deepEqual(res.body.at(-1), { id: 'vincentian', name: 'Vincentian' });
    assert.equal(res.body.some((c: { id: string }) => c.id === 'cuban'), false);
  });

  it('Given the occasions, when they are asked for, then each has a count of published caterers and a photo', async () => {
    const res = await api.client().get('/api/public/occasions');
    assert.deepEqual(res.body.map((o: { id: string; count: number }) => [o.id, o.count]), [
      ['weddings', 23],
      ['birthdays', 41],
      ['corporate-events', 28],
      ['funerals-and-repasts', 17],
      ['religious-and-cultural-celebrations', 26],
      ['family-gatherings', 47],
      ['private-dinners', 12],
      ['community-events', 19],
    ]);
    assert.equal(res.body[0].photo.src, '/media/sorrel-and-spice.jpg?w=800&fm=jpeg');
  });

  it('Given a forward sortation area, when it is looked up, then it resolves to its service area; an unknown one is not found', async () => {
    assert.deepEqual((await api.client().get('/api/public/fsa/m1b')).body, { id: 'scarborough', name: 'Scarborough' });
    const outside = await api.client().get('/api/public/fsa/X9X');
    assert.equal(outside.status, 404);
    assert.equal(outside.body.title, 'Sweet Hand currently serves Toronto and the GTA', 'L2-012.5');
  });

  it('Given text that is not a forward sortation area, when it is looked up, then it is refused with the postal-code message (L2-012.4, L2-012.6)', async () => {
    for (const bad of ['12345', 'MMM', 'D1A', 'W1A', 'M1B2K3']) {
      const res = await api.client().get(`/api/public/fsa/${bad}`);
      assert.equal(res.status, 400, bad);
      assert.deepEqual(res.body.errors, { postalCode: ['Enter a valid postal code, like M5V 2T6'] });
    }
  });

  it('Given no notices, when they are asked for, then the list is empty', async () => {
    assert.deepEqual((await api.client().get('/api/public/notices')).body, []);
  });
});

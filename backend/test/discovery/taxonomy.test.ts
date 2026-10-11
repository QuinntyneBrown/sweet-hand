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

  it('Given a retired cuisine, when the cuisine list is asked for, then it is left out', async () => {
    await api.env.db.transaction(async (tx) => {
      const cuban = (await cuisines(tx).get('cuban'))!;
      await cuisines(tx).put({ ...cuban, retired: true });
    });
    const res = await api.client().get('/api/public/cuisines');
    assert.equal(res.body.length, 17);
    assert.deepEqual(res.body[0], { id: 'antiguan-and-barbudan', name: 'Antiguan & Barbudan' });
    assert.deepEqual(res.body.at(-1), { id: 'pan-caribbean', name: 'Pan-Caribbean' });
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
    assert.equal((await api.client().get('/api/public/fsa/X9X')).status, 404);
  });

  it('Given no notices, when they are asked for, then the list is empty', async () => {
    assert.deepEqual((await api.client().get('/api/public/notices')).body, []);
  });
});

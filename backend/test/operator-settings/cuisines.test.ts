import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi } from '../support/api.ts';

const LEAH = 'leah@sweethand.example';
const TOMAS = 'tomas@sweethand.example';
const NOW = '2026-10-10T14:00:00.000Z';

describe('manage the cuisine list (L2-007)', () => {
  it('Given the launch list, when an operator reads it, then the 18 cuisines come A to Z with the published caterers using each (L2-007.1)', async () => {
    const api = await startApi();
    const tomas = await signedInClient(api, TOMAS);

    const res = await tomas.get('/api/operator/cuisines');

    assert.equal(res.status, 200);
    assert.equal(res.body.length, 18);
    assert.deepEqual(res.body.slice(11, 14).map((c: { name: string }) => c.name), ['Kittitian & Nevisian', 'Pan-Caribbean', 'Puerto Rican']);
    const byName = (name: string) => res.body.find((c: { name: string }) => c.name === name);
    assert.deepEqual(byName('Antiguan & Barbudan'), {
      id: 'antiguan-and-barbudan',
      name: 'Antiguan & Barbudan',
      retired: false,
      addedAt: '2026-08-03T13:00:00Z',
      addedBy: null,
      retiredAt: null,
      publishedCaterers: 2,
    });
    assert.equal(byName('Belizean').publishedCaterers, 1);
    assert.equal(byName('Bahamian').publishedCaterers, 0);
  });

  it('Given an operator adds "Caymanian", when it is saved, then it is new, selectable and offered by the filter, and the audit log records it (L2-007.4, L2-060)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const res = await leah.post('/api/operator/cuisines', { name: '  Caymanian ' });

    assert.equal(res.status, 201);
    assert.deepEqual(res.body, { id: 'caymanian', name: 'Caymanian', retired: false, addedAt: NOW, addedBy: 'Leah Mohammed', retiredAt: null, publishedCaterers: 0 });
    const list = await leah.get('/api/operator/cuisines');
    assert.equal(list.body.length, 19);
    assert.equal(list.body[4].name, 'Caymanian');
    const offered = await api.client().get('/api/public/cuisines');
    assert.deepEqual(offered.body.at(-1), { id: 'caymanian', name: 'Caymanian' });
    const entries = (await documents(api, 'audit')).filter((e) => e.targetId === 'caymanian');
    assert.equal(entries.length, 1);
    assert.deepEqual(
      { ...entries[0], id: undefined, seq: undefined },
      { id: undefined, seq: undefined, at: NOW, operatorId: 'user-leah', action: 'AddCuisine', targetType: 'cuisine', targetId: 'caymanian', reason: 'Added to the cuisine list', before: null, after: 'Caymanian' },
    );
  });

  it('Given an empty, one-letter or duplicate name, when it is added, then it is refused field by field and nothing is saved (L2-068.3)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const empty = await leah.post('/api/operator/cuisines', { name: '   ' });
    const short = await leah.post('/api/operator/cuisines', { name: 'C' });
    const long = await leah.post('/api/operator/cuisines', { name: 'x'.repeat(41) });
    const duplicate = await leah.post('/api/operator/cuisines', { name: 'jamaican' });
    const accented = await leah.post('/api/operator/cuisines', { name: 'HAÏTIAN' });

    assert.equal(empty.status, 400);
    assert.deepEqual(empty.body.errors, { name: ['Enter a cuisine name'] });
    assert.deepEqual(short.body.errors, { name: ['Use 2 to 40 characters'] });
    assert.deepEqual(long.body.errors, { name: ['Use 2 to 40 characters'] });
    assert.deepEqual(duplicate.body.errors, { name: ['Jamaican is already on the list'] });
    assert.deepEqual(accented.body.errors, { name: ['Haitian is already on the list'] });
    assert.equal((await documents(api, 'cuisines')).length, 18);
    assert.equal((await documents(api, 'audit')).filter((e) => e.action === 'AddCuisine').length, 0);
  });

  it('Given a cuisine two published caterers use, when its usage is asked for, then both are named for the retire warning (L2-007.5)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const res = await leah.get('/api/operator/cuisines/pan-caribbean/usage');
    const missing = await leah.get('/api/operator/cuisines/no-such-cuisine/usage');

    assert.equal(res.status, 200);
    assert.equal(res.body.cuisine.name, 'Pan-Caribbean');
    assert.deepEqual(res.body.caterers.map((c: { name: string; slug: string }) => [c.name, c.slug]), [
      ['Mauby & Co.', 'mauby-and-co'],
      ['Sea Moss & Spice', 'sea-moss-and-spice'],
    ]);
    assert.match(res.body.caterers[0].photo, /^\/media\/.+\?w=400&fm=jpeg$/);
    assert.equal(missing.status, 404);
  });

  it('Given an operator retires a cuisine, when it is saved, then it leaves the filter, its caterers keep it, it is audited once and retiring again changes nothing (L2-007.5)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const res = await leah.post('/api/operator/cuisines/pan-caribbean/retire');
    const again = await leah.post('/api/operator/cuisines/pan-caribbean/retire');

    assert.equal(res.status, 200);
    assert.equal(res.body.cuisine.retired, true);
    assert.equal(res.body.cuisine.retiredAt, NOW);
    assert.equal(res.body.caterers.length, 2);
    assert.equal(again.status, 200);
    const offered = await api.client().get('/api/public/cuisines');
    assert.equal(offered.body.some((c: { id: string }) => c.id === 'pan-caribbean'), false);
    const mauby = await api.client().get('/api/public/caterers/mauby-and-co');
    assert.ok(JSON.stringify(mauby.body).includes('Pan-Caribbean'));
    const entries = (await documents(api, 'audit')).filter((e) => e.action === 'RetireCuisine');
    assert.equal(entries.length, 1);
    assert.equal(entries[0].operatorId, 'user-leah');
    assert.equal(entries[0].targetType, 'cuisine');
    assert.equal(entries[0].targetId, 'pan-caribbean');
    assert.equal(entries[0].before, 'Active');
    assert.equal(entries[0].after, 'Retired');
    assert.equal((await leah.post('/api/operator/cuisines/nothing/retire')).status, 404);
  });
});

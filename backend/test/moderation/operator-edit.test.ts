import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, signedInClient, startApi, type Api } from '../support/api.ts';
import { auditOf } from './support.ts';

const WITHOUT_PHONE =
  'Kendra Baptiste learned to burn sugar for pelau in her grandmother’s kitchen in Couva.\n\nEverything is cooked the morning of your event and arrives hot, with chafing dishes and serving spoons.';
const caterer = async (api: Api, id: string) => (await documents(api, 'caterers')).find((c) => c.id === id);

describe('operator edits to caterer profiles (L2-057)', () => {
  it('Given an edit without a reason, when it is saved, then it is refused with "Add a reason for this change" and nothing changes (L2-057.4)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const res = await leah.patch('/api/operator/profiles/cat-001', { field: 'description', value: WITHOUT_PHONE, reason: ' ' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { reason: ['Add a reason for this change'] });
    const both = await leah.patch('/api/operator/profiles/cat-001', { field: 'description', value: 'Too short', reason: '' });
    assert.deepEqual(both.body.errors, { value: ['Write 50 to 2,000 characters'], reason: ['Add a reason for this change'] });
    assert.notEqual((await caterer(api, 'cat-001')).description, WITHOUT_PHONE);
    assert.deepEqual(await auditOf(api), []);
  });

  it('Given a description edit with a reason, when it is saved, then it goes live, the caterer is emailed the reason and it is audited with before and after (L2-057.1, L2-060)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const before = (await caterer(api, 'cat-001')).description;
    const res = await leah.patch('/api/operator/profiles/cat-001', { field: 'description', value: WITHOUT_PHONE, reason: 'Removed phone number from description' });
    assert.equal(res.status, 200);
    assert.equal(res.body.profile.description, WITHOUT_PHONE, 'the updated record comes back');
    assert.equal((await api.client().get('/api/public/caterers/pelau-house')).body.description, WITHOUT_PHONE);
    assert.ok((await outbox(api)).some((e) => e.to === 'kendra@pelauhouse.example' && e.kind === 'operator-edit' && e.reason === 'Removed phone number from description'));
    assert.deepEqual((await auditOf(api)).map((a) => [a.operatorId, a.action, a.targetId, a.reason, a.before, a.after]), [
      ['user-leah', 'Edit', 'cat-001', 'Removed phone number from description', { description: before }, { description: WITHOUT_PHONE }],
    ]);
  });

  it('Given a guest range, list fields and a name, when an operator edits them, then the caterer editor’s rules apply', async () => {
    const api = await startApi();
    const tomas = await signedInClient(api, 'tomas@sweethand.example');
    const reason = 'Confirmed with Kendra by phone.';
    assert.deepEqual((await tomas.patch('/api/operator/profiles/cat-001', { field: 'guests', value: { min: 20, max: 10 }, reason })).body.errors, { max: ['Make the most guests at least the fewest'] });
    assert.equal((await tomas.patch('/api/operator/profiles/cat-001', { field: 'guests', value: { min: 20, max: 250 }, reason })).body.profile.maxGuests, 250);
    assert.deepEqual((await tomas.patch('/api/operator/profiles/cat-001', { field: 'cuisines', value: 'Trinidadian & Tobagonian, Martian', reason })).body.errors, { value: ['“Martian” isn’t on the cuisine list'] });
    assert.deepEqual((await tomas.patch('/api/operator/profiles/cat-001', { field: 'cuisines', value: 'trinidadian & tobagonian', reason })).body.profile.cuisines, ['Trinidadian & Tobagonian']);
    assert.deepEqual((await tomas.patch('/api/operator/profiles/cat-001', { field: 'areas', value: ['Scarborough', 'Ajax'], reason })).body.profile.areas, ['Scarborough', 'Ajax']);
    assert.deepEqual((await tomas.patch('/api/operator/profiles/cat-001', { field: 'occasions', value: '', reason })).body.errors, { value: ['Choose at least one occasion'] });
    assert.deepEqual((await tomas.patch('/api/operator/profiles/cat-001', { field: 'status', value: 'Published', reason })).body.errors, { field: ['Choose a field'] });
    const renamed = await tomas.patch('/api/operator/profiles/cat-001', { field: 'name', value: 'Pelau House Catering', reason });
    assert.equal(renamed.body.slug, 'pelau-house-catering');
    assert.deepEqual((await caterer(api, 'cat-001')).previousSlugs, ['pelau-house']);
  });

  it('Given a removed caterer, when an operator edits it, then the answer is 409', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    assert.equal((await leah.patch('/api/operator/profiles/cat-901', { field: 'description', value: WITHOUT_PHONE, reason: 'Tidy.' })).status, 409);
  });

  it('Given a photo removal that drops below the minimum, when it is saved, then it goes ahead, the profile stays published and the caterer has 14 days to replace it (L2-057.2)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    assert.equal((await leah.request('DELETE', '/api/operator/profiles/cat-005/photos/black-cake-co-photo-3', {})).status, 400, 'a reason is needed');
    const res = await leah.request('DELETE', '/api/operator/profiles/cat-005/photos/black-cake-co-photo-3', { reason: 'Photo shows another caterer’s logo.' });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { replaceBy: '2026-10-24' });
    const blackCake = await caterer(api, 'cat-005');
    assert.equal(blackCake.status, 'Published');
    assert.equal(blackCake.photos.length, 2);
    assert.ok((await outbox(api)).some((e) => e.to === 'paulette@blackcakeco.example' && e.kind === 'operator-removed-photo' && e.reason === 'Photo shows another caterer’s logo.' && e.replaceBy === '2026-10-24'));
    const audit = await auditOf(api);
    assert.deepEqual([audit[0].action, audit[0].targetId, audit[0].before.photo.id, audit[0].after], ['Remove photo', 'cat-005', 'black-cake-co-photo-3', null]);
    assert.equal((await leah.request('DELETE', '/api/operator/profiles/cat-005/photos/black-cake-co-photo-3', { reason: 'Again.' })).status, 404);
  });

  it('Given a dish removal above the minimum, when it is saved, then no replacement is asked for', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const res = await leah.request('DELETE', '/api/operator/profiles/cat-001/menu-items/pelau-house-dish-11', { reason: 'Duplicate of the shrimp dish further down.' });
    assert.deepEqual(res.body, { replaceBy: null });
    assert.equal((await caterer(api, 'cat-001')).dishes.length, 17);
    assert.equal((await auditOf(api))[0].action, 'Remove dish');
    assert.ok((await outbox(api)).some((e) => e.kind === 'operator-removed-dish' && e.replaceBy === undefined));
  });
});

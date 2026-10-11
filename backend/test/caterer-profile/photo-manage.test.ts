import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi, type Api } from '../support/api.ts';
import type { Caterer } from '../../src/caterers/model.ts';
import { CAST_NOW } from '../../src/platform/clock.ts';

const KENDRA = 'kendra@pelauhouse.example';
const pelau = async (api: Api) => (await documents<Caterer>(api, 'caterers')).find((c) => c.id === 'cat-001')!;
const ids = async (api: Api) => (await pelau(api)).photos.map((p) => p.id);
const coverEdits = async (api: Api) => (await documents(api, 'profileEdits')).filter((e) => e.catererId === 'cat-001' && e.field === 'cover-photo' && e.at >= CAST_NOW);
const P = (n: number) => `pelau-house-photo-${n}`;

describe('managing photos (manage-photos design, L2-042)', () => {
  it('Given a caption outside 5–125 characters, when saved, then it is refused with the caption message (L2-042.3)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const short = await kendra.patch(`/api/caterer/profile/photos/${P(2)}`, { caption: 'Roti', useAsCover: false });
    const long = await kendra.patch(`/api/caterer/profile/photos/${P(2)}`, { caption: 'x'.repeat(126), useAsCover: false });

    for (const res of [short, long]) {
      assert.equal(res.status, 400);
      assert.deepEqual(res.body.errors, { caption: ['Captions describe the photo in 5–125 characters'] });
    }
  });

  it('Given a good caption, when saved, then the photo keeps its place and the profile comes back', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.patch(`/api/caterer/profile/photos/${P(2)}`, { caption: '  Curry chicken with rice and buss up shut ', useAsCover: false });

    assert.equal(res.status, 200);
    assert.equal(res.body.photos[1].caption, 'Curry chicken with rice and buss up shut');
    assert.deepEqual(await ids(api), [1, 2, 3, 4, 5, 6].map(P));
    assert.deepEqual(await coverEdits(api), []);
  });

  it('Given "Use as cover photo", when saved, then the photo moves to position 1 and the feed records the new cover (L2-042.6, L2-044.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.patch(`/api/caterer/profile/photos/${P(3)}`, { caption: 'Spiced rice lifted from a blue cast-iron pot', useAsCover: true });

    assert.equal(res.status, 200);
    assert.deepEqual(await ids(api), [3, 1, 2, 4, 5, 6].map(P));
    assert.equal(res.body.cover.alt, 'Spiced rice lifted from a blue cast-iron pot');
    const [edit] = await coverEdits(api);
    assert.deepEqual(edit.old, { kind: 'photo', src: '/media/pelau-house.jpg?w=400&fm=jpeg', alt: 'Chicken pelau in a steel pot with lime and cucumber chutney' });
    assert.deepEqual(edit.new, { kind: 'photo', src: '/media/sunday-pot.jpg?w=400&fm=jpeg', alt: 'Spiced rice lifted from a blue cast-iron pot' });
  });

  it('Given every photo id once, when reordered, then the order is saved; a list that misses one or repeats one is refused (L2-042.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    assert.equal((await kendra.put('/api/caterer/profile/photos/order', { photoIds: [1, 2, 3, 4, 5].map(P) })).status, 400);
    assert.equal((await kendra.put('/api/caterer/profile/photos/order', { photoIds: [1, 1, 2, 3, 4, 5].map(P) })).status, 400);
    const res = await kendra.put('/api/caterer/profile/photos/order', { photoIds: [1, 2, 3, 5, 4, 6].map(P) });

    assert.equal(res.status, 200);
    assert.deepEqual(await ids(api), [1, 2, 3, 5, 4, 6].map(P));
    assert.deepEqual(await coverEdits(api), [], 'the cover did not change');
  });

  it('Given a photo moved to position 1, when the order is saved, then it is the new cover in the feed', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    await kendra.put('/api/caterer/profile/photos/order', { photoIds: [5, 1, 2, 3, 4, 6].map(P) });

    assert.equal((await coverEdits(api)).length, 1);
  });

  it('Given a photo, when removed and then restored, then it leaves the page and comes back in its place', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const removed = await kendra.delete(`/api/caterer/profile/photos/${P(2)}`);
    assert.equal(removed.status, 200);
    assert.deepEqual(await ids(api), [1, 3, 4, 5, 6].map(P));

    const restored = await kendra.post(`/api/caterer/profile/photos/${P(2)}/restoration`);
    assert.equal(restored.status, 200);
    assert.deepEqual(await ids(api), [1, 2, 3, 4, 5, 6].map(P));
    assert.equal((await kendra.post(`/api/caterer/profile/photos/${P(2)}/restoration`)).status, 404, 'a photo is restored once');
  });

  it('Given the cover is removed, when saved, then the feed records the new cover', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    await kendra.delete(`/api/caterer/profile/photos/${P(1)}`);

    const [edit] = await coverEdits(api);
    assert.equal(edit.new.alt, 'Curry chicken with rice and buss up shut in a steel karahi');
  });

  it('Given a published caterer with exactly 3 photos, when they remove one, then it is refused (L2-042.4)', async () => {
    const api = await startApi();
    const paulette = await signedInClient(api, 'paulette@blackcakeco.example');

    const res = await paulette.delete('/api/caterer/profile/photos/black-cake-co-photo-1');

    assert.equal(res.status, 409);
    assert.equal(res.body.title, 'Published profiles need at least 3 photos');
  });

  it('Given another caterer’s photo, removed or not, when Kendra edits, removes or restores it, then it is not found (L2-079.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const vishnu = await signedInClient(api, 'vishnu@maracasbay.example');
    const vishnuPhoto = (await documents<Caterer>(api, 'caterers')).find((c) => c.id === 'cat-009')!.photos[0].id;
    await vishnu.delete(`/api/caterer/profile/photos/${vishnuPhoto}`);

    assert.equal((await kendra.patch('/api/caterer/profile/photos/black-cake-co-photo-1', { caption: 'Mine now, honestly', useAsCover: true })).status, 404);
    assert.equal((await kendra.delete('/api/caterer/profile/photos/black-cake-co-photo-1')).status, 404);
    assert.equal((await kendra.post(`/api/caterer/profile/photos/${vishnuPhoto}/restoration`)).status, 404);
    assert.equal((await pelau(api)).photos.length, 6);
  });
});

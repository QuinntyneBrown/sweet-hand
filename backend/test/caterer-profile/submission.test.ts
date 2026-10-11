import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi, type Api } from '../support/api.ts';
import { caterers, type Caterer } from '../../src/caterers/model.ts';
import { users } from '../../src/identity/model.ts';
import { CAST_NOW } from '../../src/platform/clock.ts';

const KENDRA = 'kendra@pelauhouse.example';
const pelau = async (api: Api) => (await documents<Caterer>(api, 'caterers')).find((c) => c.id === 'cat-001')!;
const history = async (api: Api) => (await documents(api, 'statusHistory')).filter((h) => h.catererId === 'cat-001' && h.at >= CAST_NOW);

async function change(api: Api, patch: (c: Caterer) => Partial<Caterer>): Promise<void> {
  await api.env.db.transaction(async (tx) => {
    const c = (await caterers(tx).get('cat-001'))!;
    await caterers(tx).put({ ...c, ...patch(c) });
  });
}

describe('submit for review (submit-profile-for-review design, L2-039, L2-046)', () => {
  it('Given a draft that meets every rule, when submitted, then it is Pending review and the history records who submitted it (L2-039.1, L2-046.4)', async () => {
    const api = await startApi();
    await change(api, () => ({ status: 'Draft' }));
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.post('/api/caterer/profile/submission');

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'Pending review');
    const now = api.env.clock.now().toISOString();
    assert.equal(res.body.statusChangedAt, now);
    assert.equal((await pelau(api)).status, 'Pending review');
    const [entry, ...more] = await history(api);
    assert.deepEqual(more, []);
    assert.deepEqual({ ...entry, id: undefined, seq: undefined }, { id: undefined, seq: undefined, catererId: 'cat-001', at: now, status: 'Pending review', by: 'user-kendra', step: 'submitted' });
  });

  it('Given a draft that breaks several rules, when submitted through the API, then the answer is 422 listing every rule that failed (L2-039.2, L2-039.3)', async () => {
    const api = await startApi();
    await change(api, (c) => ({ status: 'Draft', description: 'Too short.', photos: c.photos.slice(0, 2), certificate: undefined }));
    await api.env.db.transaction(async (tx) => {
      const u = (await users(tx).get('user-kendra'))!;
      await users(tx).put({ ...u, emailVerified: false });
    });
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.post('/api/caterer/profile/submission');

    assert.equal(res.status, 422);
    assert.deepEqual(res.body, {
      title: 'Your profile isn’t ready yet',
      failed: [
        { key: 'email', detail: null },
        { key: 'description', detail: null },
        { key: 'photos', detail: 'you have 2' },
        { key: 'certificate', detail: null },
      ],
    });
    assert.equal((await pelau(api)).status, 'Draft');
    assert.deepEqual(await history(api), []);
  });

  it('Given a profile with changes requested, when resubmitted, then the operator’s notes are cleared and the history says resubmitted (L2-048.3)', async () => {
    const api = await startApi();
    await change(api, () => ({ status: 'Changes requested', statusReason: 'Photo 4 is blurry.', attention: [{ key: 'photos', note: 'Replace photo 4' }] }));
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.post('/api/caterer/profile/submission');

    assert.equal(res.status, 200);
    const c = await pelau(api);
    assert.equal(c.status, 'Pending review');
    assert.equal(c.statusReason, undefined);
    assert.equal(c.attention, undefined);
    assert.equal((await history(api))[0].step, 'resubmitted');
  });

  it('Given a published profile, when submitted, then the answer is 409', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.post('/api/caterer/profile/submission');

    assert.equal(res.status, 409);
    assert.equal(res.body.title, 'Only a draft can be submitted');
  });

  it('Given a profile in review, when the caterer withdraws it, then it is a Draft again (L2-039.4); withdrawing anything else is refused', async () => {
    const api = await startApi();
    await change(api, () => ({ status: 'Pending review', statusChangedAt: '2026-10-07T15:00:00Z' }));
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.delete('/api/caterer/profile/submission');

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'Draft');
    assert.equal((await pelau(api)).statusChangedAt, api.env.clock.now().toISOString());
    const again = await kendra.delete('/api/caterer/profile/submission');
    assert.equal(again.status, 409);
    assert.equal(again.body.title, 'Only a profile waiting for review can be withdrawn');
  });
});

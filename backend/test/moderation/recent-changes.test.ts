import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, signedInClient, startApi, type Api } from '../support/api.ts';
import { auditOf, scenario } from './support.ts';

const OLD = 'Everything is cooked the morning of your event and arrives hot, with chafing dishes.';
const NEW = 'Everything is cooked the morning of your event and arrives hot, with chafing dishes and serving spoons. Doubles and aloo pie are made to order for groups of 40 or more.';
const caterer = async (api: Api, id: string) => (await documents(api, 'caterers')).find((c) => c.id === id);

describe('recent changes and revert (L2-047.4, L2-057.3)', () => {
  it('Given caterer edits to published profiles, when an operator opens the feed, then the last 30 days are listed newest first with old and new values (L2-047.4)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const res = await leah.get('/api/operator/recent-changes');
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 24);
    assert.equal(res.body.items.length, 20);
    assert.deepEqual(res.body.items[0], {
      id: 'edit-001',
      catererId: 'cat-001',
      catererName: 'Pelau House',
      photo: '/media/pelau-house.jpg?w=400&fm=jpeg',
      field: 'description',
      by: 'Kendra Baptiste',
      at: '2026-10-10T12:15:00.000Z',
      old: { kind: 'text', text: OLD },
      new: { kind: 'text', text: NEW },
      reverted: null,
    });
    assert.deepEqual(res.body.items[4].reverted, { by: 'Leah Mohammed', at: '2026-10-06T17:02:00.000Z' });
    assert.equal(res.body.items[2].by, 'Tanisha Reid');
    const page2 = await leah.get('/api/operator/recent-changes?page=2');
    assert.equal(page2.body.items.length, 4);
    assert.ok(page2.body.items.every((e: any) => e.id !== 'edit-025'), 'older than 30 days is never in the feed');
  });

  it('Given a recent edit, when an operator reverts it with a reason, then the earlier value is back, the caterer is emailed and it is audited (L2-057.3)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    assert.deepEqual((await leah.post('/api/operator/recent-changes/edit-001/revert', { reason: '' })).body.errors, { reason: ['Add a reason for this change'] });
    const reason = 'Restoring the earlier wording while we check the new delivery claim with Kendra.';
    const res = await leah.post('/api/operator/recent-changes/edit-001/revert', { reason });
    assert.equal(res.status, 204);
    const pelau = await caterer(api, 'cat-001');
    assert.ok(pelau.description.includes(OLD) && !pelau.description.includes(NEW));
    const feed = await leah.get('/api/operator/recent-changes');
    assert.deepEqual(feed.body.items[0].reverted, { by: 'Leah Mohammed', at: '2026-10-10T14:00:00.000Z' });
    assert.deepEqual((await auditOf(api)).map((a) => [a.action, a.targetType, a.targetId, a.reason, a.before, a.after]), [
      ['Revert', 'caterer', 'cat-001', reason, { description: { kind: 'text', text: NEW } }, { description: { kind: 'text', text: OLD }, revertedChange: 'edit-001' }],
    ]);
    assert.ok((await outbox(api)).some((e) => e.kind === 'change-reverted' && e.to === 'kendra@pelauhouse.example' && e.reason === reason));
    assert.equal((await leah.post('/api/operator/recent-changes/edit-001/revert', { reason })).status, 409, 'already undone');
  });

  it('Given guest, area, menu and cover-photo edits, when they are reverted, then each field goes back', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const reason = 'Undo.';
    for (const id of ['edit-002', 'edit-003', 'edit-004', 'edit-006']) assert.equal((await leah.post(`/api/operator/recent-changes/${id}/revert`, { reason })).status, 204, id);
    const coucou = await caterer(api, 'cat-002');
    assert.deepEqual([coucou.minGuests, coucou.maxGuests], [20, 150]);
    assert.equal((await caterer(api, 'cat-003')).dishes.some((d: any) => d.name === 'Escovitch fish'), false);
    assert.equal((await caterer(api, 'cat-004')).photos[0].file, 'griot-and-pikliz.jpg');
    assert.deepEqual((await caterer(api, 'cat-006')).areas, ['brampton', 'mississauga']);
    assert.equal((await leah.post('/api/operator/recent-changes/edit-nope/revert', { reason })).status, 404);
  });

  it('Given a description that changed again since, when the old edit is reverted, then it is refused with 409', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    await leah.patch('/api/operator/profiles/cat-001', { field: 'description', value: 'An entirely new description that no longer holds the edited sentence at all.', reason: 'Rewrite.' });
    const res = await leah.post('/api/operator/recent-changes/edit-001/revert', { reason: 'Undo.' });
    assert.equal(res.status, 409);
    assert.equal(res.body.title, 'The field changed again since');
  });

  it('Given no edits in the last 30 days, when the feed is opened, then it is empty', async () => {
    const api = await startApi();
    await scenario(api, 'no-recent-changes');
    const res = await (await signedInClient(api, 'leah@sweethand.example')).get('/api/operator/recent-changes');
    assert.equal(res.body.total, 0);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, signedInClient, startApi, type Api } from '../support/api.ts';
import { scenario } from './support.ts';

const auditOf = async (api: Api) => (await documents(api, 'audit')).sort((a, b) => a.seq - b.seq);
const caterer = async (api: Api, id: string) => (await documents(api, 'caterers')).find((c) => c.id === id);

describe('approval decisions (L2-046, L2-048, L2-060)', () => {
  it('Given a pending profile, when an operator approves it, then it is published, the caterer is emailed a link, the history and the audit log record it (L2-048.1, L2-048.4, L2-046.4)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const res = await leah.post('/api/operator/profiles/cat-910/approve');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { id: 'cat-910', name: 'Auntie Bev’s Kitchen', slug: 'auntie-bevs-kitchen', status: 'Published', owner: 'Beverley Campbell' });
    const bev = await caterer(api, 'cat-910');
    assert.equal(bev.status, 'Published');
    assert.equal(bev.publishedAt, '2026-10-10T14:00:00.000Z');
    assert.deepEqual((await auditOf(api)).map((a) => [a.operatorId, a.action, a.targetType, a.targetId, a.reason, a.before, a.after, a.at]), [
      ['user-leah', 'Approve', 'CatererProfile', 'cat-910', null, { status: 'Pending review' }, { status: 'Published' }, '2026-10-10T14:00:00.000Z'],
    ]);
    const mail = (await outbox(api)).find((e) => e.kind === 'profile-approved');
    assert.equal(mail?.to, 'beverley@auntiebevs.example');
    assert.equal(mail?.link, '/caterers/auntie-bevs-kitchen');
    const history = (await documents(api, 'statusHistory')).filter((h) => h.catererId === 'cat-910').sort((a, b) => a.seq - b.seq);
    assert.deepEqual(history.at(-1), { ...history.at(-1), status: 'Published', step: 'approved', by: 'user-leah', at: '2026-10-10T14:00:00.000Z' });
    assert.equal((await api.client().get('/api/public/caterers/auntie-bevs-kitchen')).status, 200, 'it is public now');
  });

  it('Given a profile that is not pending, when an operator approves it, then the answer is 409 with its status and nothing is recorded (L2-046.2)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const res = await leah.post('/api/operator/profiles/cat-913/approve');
    assert.equal(res.status, 409);
    assert.deepEqual(res.body, { title: 'This profile changed', status: 'Draft', name: 'Callaloo Corner' });
    assert.deepEqual(await auditOf(api), []);
    assert.equal((await leah.post('/api/operator/profiles/cat-nope/approve')).status, 404);
  });

  it('Given a caterer, when they call the approve endpoint, then the answer is 403 and nothing changes (L2-046.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, 'kendra@pelauhouse.example');
    assert.equal((await kendra.post('/api/operator/profiles/cat-910/approve')).status, 403);
    assert.equal((await caterer(api, 'cat-910')).status, 'Pending review');
  });

  it('Given a reason under 10 characters, when an operator requests changes, then it is refused with "Explain what the caterer needs to change" (L2-048.2)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const res = await leah.post('/api/operator/profiles/cat-910/request-changes', { reason: '  Photos  ' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { reason: ['Explain what the caterer needs to change'] });
    assert.equal((await caterer(api, 'cat-910')).status, 'Pending review');
  });

  it('Given a reason, when an operator requests changes, then the status and banner reason change, the caterer is emailed it, a snapshot is kept and it is audited (L2-048.3)', async () => {
    const api = await startApi();
    const tomas = await signedInClient(api, 'tomas@sweethand.example');
    const res = await tomas.post('/api/operator/profiles/cat-910/request-changes', { reason: 'Photos 2 and 5 show stock images' });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'Changes requested');
    const bev = await caterer(api, 'cat-910');
    assert.equal(bev.status, 'Changes requested');
    assert.equal(bev.statusReason, 'Photos 2 and 5 show stock images');
    assert.ok((await outbox(api)).some((e) => e.kind === 'changes-requested' && e.to === 'beverley@auntiebevs.example' && e.reason === 'Photos 2 and 5 show stock images'));
    const snapshot = (await documents(api, 'profileSnapshots')).find((s) => s.id === 'cat-910');
    assert.equal(snapshot.photoFiles.length, 5);
    assert.deepEqual((await auditOf(api)).map((a) => [a.operatorId, a.action, a.reason, a.after]), [['user-tomas', 'Request changes', 'Photos 2 and 5 show stock images', { status: 'Changes requested' }]]);
  });

  it('Given a pending name change, when an operator approves it, then the new name and address go live and the old address redirects (L2-044.3, L2-018.3)', async () => {
    const api = await startApi();
    await scenario(api, 'pelau-name-change-pending');
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const res = await leah.post('/api/operator/profiles/cat-001/name/approve');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { id: 'cat-001', name: 'Pelau House by Kendra', slug: 'pelau-house-by-kendra', status: 'Published', owner: 'Kendra Baptiste' });
    const pelau = await caterer(api, 'cat-001');
    assert.equal(pelau.pendingName, undefined);
    assert.deepEqual(pelau.previousSlugs, ['pelau-house']);
    const audit = await auditOf(api);
    assert.deepEqual([audit[0].action, audit[0].before, audit[0].after], ['Approve name change', { name: 'Pelau House', slug: 'pelau-house' }, { name: 'Pelau House by Kendra', slug: 'pelau-house-by-kendra' }]);
    assert.ok((await outbox(api)).some((e) => e.kind === 'name-approved' && e.to === 'kendra@pelauhouse.example' && e.link === '/caterers/pelau-house-by-kendra'));
    assert.equal((await leah.post('/api/operator/profiles/cat-001/name/approve')).status, 409, 'nothing waits any more');
  });

  it('Given a pending name change, when an operator sends it back with a reason, then the current name stays and the caterer is told why (L2-044)', async () => {
    const api = await startApi();
    await scenario(api, 'pelau-name-change-pending');
    const leah = await signedInClient(api, 'leah@sweethand.example');
    assert.equal((await leah.post('/api/operator/profiles/cat-001/name/request-changes', { reason: 'Too short' })).status, 400);
    const res = await leah.post('/api/operator/profiles/cat-001/name/request-changes', { reason: 'Use the business name on your food handler certificate.' });
    assert.equal(res.status, 200);
    const pelau = await caterer(api, 'cat-001');
    assert.equal(pelau.name, 'Pelau House');
    assert.equal(pelau.pendingName, undefined);
    const audit = await auditOf(api);
    assert.deepEqual([audit[0].action, audit[0].before, audit[0].after], ['Reject name change', { name: 'Pelau House', requested: 'Pelau House by Kendra' }, { name: 'Pelau House' }]);
    assert.ok((await outbox(api)).some((e) => e.kind === 'name-change-declined' && e.reason === 'Use the business name on your food handler certificate.'));
  });
});

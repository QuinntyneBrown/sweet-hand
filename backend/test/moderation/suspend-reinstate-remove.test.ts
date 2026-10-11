import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, signedInClient, startApi, type Api } from '../support/api.ts';
import { put } from './support.ts';

const REASON = 'Food safety concern under investigation after report R-2047. Please send your latest inspection notice.';
const auditOf = async (api: Api) => (await documents(api, 'audit')).sort((a, b) => a.seq - b.seq);
const caterer = async (api: Api, id: string) => (await documents(api, 'caterers')).find((c) => c.id === id);

const enquiry = (id: string, customerId: string, status: string) => ({
  id,
  customerId,
  catererId: 'cat-001',
  eventDate: '2026-11-21',
  guests: 60,
  area: 'scarborough',
  fsa: null,
  occasion: 'birthdays',
  message: 'Pelau for 60.',
  createdAt: '2026-10-01T14:00:00.000Z',
  status,
  events: [],
  readAt: {},
});

async function withPelauEnquiries(api: Api) {
  await put(api, 'enquiries', enquiry('enq-t1', 'user-marcia', 'Open'), enquiry('enq-t2', 'user-priya', 'Replied'), enquiry('enq-t3', 'user-andre', 'Declined'));
}

describe('suspending, reinstating and removing caterers (L2-058, L2-060)', () => {
  it('Given a reason, when an operator suspends a published caterer, then it is hidden, open enquiries close, everyone is emailed and it is audited (L2-058.1, L2-058.2, L2-060.1)', async () => {
    const api = await startApi();
    await withPelauEnquiries(api);
    const leah = await signedInClient(api, 'leah@sweethand.example');
    assert.deepEqual((await leah.post('/api/operator/profiles/cat-001/suspend', { reason: '  ' })).body.errors, { reason: ['Add a reason for this change'] });

    const res = await leah.post('/api/operator/profiles/cat-001/suspend', { reason: REASON });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'Suspended');
    const pelau = await caterer(api, 'cat-001');
    assert.equal(pelau.statusReason, REASON);
    const statuses = (await documents(api, 'enquiries')).filter((e) => e.catererId === 'cat-001').map((e) => [e.id, e.status]);
    assert.deepEqual(statuses, [['enq-t1', 'Closed'], ['enq-t2', 'Closed'], ['enq-t3', 'Declined']]);
    const mail = await outbox(api);
    assert.ok(mail.some((e) => e.to === 'kendra@pelauhouse.example' && e.kind === 'caterer-suspended' && e.reason === REASON));
    assert.deepEqual(mail.filter((e) => e.kind === 'caterer-unavailable').map((e) => e.to), ['marcia.t@example.com', 'priya.r@example.com']);
    assert.deepEqual((await auditOf(api)).map((a) => [a.operatorId, a.action, a.targetType, a.targetId, a.reason, a.before, a.after]), [
      ['user-leah', 'Suspend', 'CatererProfile', 'cat-001', REASON, { status: 'Published' }, { status: 'Suspended' }],
    ]);
    const record = (await leah.get('/api/operator/caterers/cat-001')).body;
    assert.deepEqual(record.suspension, { at: '2026-10-10T14:00:00.000Z', closedEnquiries: 2 });
    assert.deepEqual(record.history[0], { at: '2026-10-10T14:00:00.000Z', status: 'Suspended', by: 'Leah Mohammed', step: 'suspended', reason: REASON });
    assert.equal((await api.client().get('/api/public/caterers/pelau-house')).status, 404);
  });

  it('Given a caterer that is not published, when an operator suspends it, then the answer is 409 and nothing is recorded (L2-046)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const res = await leah.post('/api/operator/profiles/cat-916/suspend', { reason: REASON });
    assert.equal(res.status, 409);
    assert.deepEqual(res.body, { title: 'This profile changed', status: 'Suspended', name: 'Hibiscus Hut' });
    assert.deepEqual(await auditOf(api), []);
  });

  it('Given a suspended caterer, when an operator reinstates it with a reason, then it is published again and the owner is emailed (L2-058.3)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    assert.equal((await leah.post('/api/operator/profiles/cat-916/reinstate', {})).status, 400);
    const res = await leah.post('/api/operator/profiles/cat-916/reinstate', { reason: 'Sharon uploaded photos of her own food.' });
    assert.equal(res.status, 200);
    const hibiscus = await caterer(api, 'cat-916');
    assert.equal(hibiscus.status, 'Published');
    assert.equal(hibiscus.statusReason, undefined);
    assert.ok((await outbox(api)).some((e) => e.to === 'sharon@hibiscushut.example' && e.kind === 'caterer-reinstated' && e.reason === 'Sharon uploaded photos of her own food.'));
    assert.deepEqual((await auditOf(api)).map((a) => [a.action, a.before, a.after]), [['Reinstate', { status: 'Suspended' }, { status: 'Published' }]]);
    assert.equal((await leah.post('/api/operator/profiles/cat-916/reinstate', { reason: 'Again.' })).status, 409);
  });

  it('Given a reason and the exact business name, when an operator removes a caterer, then it is removed for good and its page is gone (L2-058.4, L2-046.3)', async () => {
    const api = await startApi();
    await withPelauEnquiries(api);
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const refused = await leah.post('/api/operator/profiles/cat-001/remove', { reason: '', confirm: 'Pelau' });
    assert.equal(refused.status, 400);
    assert.deepEqual(refused.body.errors, { reason: ['Add a reason for this change'], confirm: ['Type the business name exactly: Pelau House'] });

    const reason = 'Business has closed; owner asked for the profile to be taken down.';
    const res = await leah.post('/api/operator/profiles/cat-001/remove', { reason, confirm: 'Pelau House' });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'Removed');
    assert.deepEqual((await auditOf(api)).map((a) => [a.action, a.reason, a.before, a.after]), [['Remove', reason, { status: 'Published' }, { status: 'Removed' }]]);
    assert.ok((await outbox(api)).some((e) => e.kind === 'caterer-removed' && e.to === 'kendra@pelauhouse.example'));
    assert.equal((await documents(api, 'enquiries')).filter((e) => e.catererId === 'cat-001' && e.status === 'Closed').length, 2);
    assert.equal((await api.client().get('/api/public/caterers/pelau-house')).status, 410);
    assert.equal((await leah.post('/api/operator/profiles/cat-001/remove', { reason, confirm: 'Pelau House' })).status, 409, 'removal is final');
    assert.equal((await leah.post('/api/operator/profiles/cat-001/reinstate', { reason })).status, 409);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, signedInClient, startApi } from '../support/api.ts';

const TOKEN = 'local:report:3f9a1c';
const DETAILS = 'The menu lists curry goat as halal, but at our event the caterer said it wasn’t.';
const pelau = (extra: Record<string, unknown> = {}) => ({ targetKind: 'CatererProfile', targetId: 'pelau-house', reason: 'Food safety concern', details: DETAILS, challengeToken: TOKEN, ...extra });

describe('reporting a listing or review (L2-054)', () => {
  it('Given a visitor who is not signed in, when they report a caterer and pass the challenge, then the report is created, open and anonymous (L2-054.1)', async () => {
    const api = await startApi();
    const res = await api.client().post('/api/reports', pelau({ status: 'Resolved', reporterUserId: 'user-tomas' }));
    assert.equal(res.status, 201);
    assert.match(res.body.id, /^R-\d{4}$/);
    const report = (await documents(api, 'reports')).find((r) => r.id === res.body.id);
    assert.equal(report.targetKind, 'CatererProfile');
    assert.equal(report.targetId, 'cat-001');
    assert.equal(report.reason, 'Food safety concern');
    assert.equal(report.details, DETAILS);
    assert.equal(report.status, 'Open');
    assert.equal(report.reporterUserId, undefined);
    assert.equal(report.createdAt, '2026-10-10T14:00:00.000Z');
    assert.match(report.connection, /^[0-9a-f]{32}$/, 'the connection only as a keyed hash');
    assert.equal(JSON.stringify(report).includes('127.0.0.1'), false);
  });

  it('Given a visitor without a valid challenge token, when they report, then it is refused and nothing is stored (L2-082.2)', async () => {
    const api = await startApi();
    const before = (await documents(api, 'reports')).length;
    for (const challengeToken of [undefined, '', 'local:sign-in:abc']) {
      const res = await api.client().post('/api/reports', pelau({ challengeToken }));
      assert.equal(res.status, 400);
      assert.deepEqual(res.body.errors, { challengeToken: ['Complete the check'] });
    }
    assert.equal((await documents(api, 'reports')).length, before);
  });

  it('Given the reason "Other" with no details, a missing reason or over-long details, when it is sent, then each field gets its message (L2-054.2)', async () => {
    const api = await startApi();
    const client = api.client();
    assert.deepEqual((await client.post('/api/reports', pelau({ reason: 'Other', details: '  ' }))).body.errors, { details: ['Tell us what’s wrong'] });
    assert.deepEqual((await client.post('/api/reports', pelau({ reason: 'Rude' }))).body.errors, { reason: ['Choose a reason'] });
    assert.deepEqual((await client.post('/api/reports', pelau({ details: 'x'.repeat(1001) }))).body.errors, { details: ['Keep the details to 1,000 characters or fewer'] });
  });

  it('Given a caterer or review that is not published, when it is reported, then it can no longer be reported', async () => {
    const api = await startApi();
    for (const target of [
      { targetKind: 'CatererProfile', targetId: 'hibiscus-hut' },
      { targetKind: 'Review', targetId: 'review-priya-sugar-dumplin' },
      { targetKind: 'Review', targetId: 'no-such-review' },
      { targetKind: 'Enquiry', targetId: 'enq-jean-robert-pelau' },
    ]) {
      const res = await api.client().post('/api/reports', pelau(target));
      assert.equal(res.status, 400, target.targetId);
      assert.deepEqual(res.body.errors, { targetId: ['This can no longer be reported'] });
    }
  });

  it('Given a published review, when a signed-in customer reports it, then the report names the review and the reporter', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, 'nadia.j@example.com')).post('/api/reports', { targetKind: 'Review', targetId: 'review-andre-pelau', reason: 'Fake or spam', details: '' });
    assert.equal(res.status, 201);
    const report = (await documents(api, 'reports')).find((r) => r.id === res.body.id);
    assert.equal(report.targetId, 'review-andre-pelau');
    assert.equal(report.reporterUserId, 'user-nadia');
    assert.equal(report.details, undefined);
  });

  it('Given one connection sent 5 reports in the past hour, when it sends a sixth, then it is refused with 429; an hour later it may report again (L2-054.3)', async () => {
    const api = await startApi();
    const client = api.client();
    for (let i = 0; i < 5; i++) {
      assert.equal((await client.post('/api/reports', pelau())).status, 201);
      advanceClock(api, 60_000);
    }
    const sixth = await client.post('/api/reports', pelau());
    assert.equal(sixth.status, 429);
    assert.equal(sixth.body.title, 'Too many reports from this connection');
    assert.ok(Number(sixth.headers.get('retry-after')) > 0);
    assert.equal((await documents(api, 'securityEvents')).some((e) => e.type === 'rate-limit-block' && e.path === '/api/reports'), true);
    advanceClock(api, 60 * 60_000);
    assert.equal((await client.post('/api/reports', pelau())).status, 201);
  });

  it('Given a signed-in customer with an open report on this caterer, when they report it again, then no new report is created and they are told when they reported it (L2-054.4)', async () => {
    const api = await startApi();
    const before = (await documents(api, 'reports')).length;
    const res = await (await signedInClient(api, 'marcia.t@example.com')).post('/api/reports', pelau({ reason: 'Inaccurate information' }));
    assert.equal(res.status, 409);
    assert.deepEqual(res.body, { title: 'You’ve already reported this', reportedAt: '2026-10-08T23:15:00.000Z' });
    assert.equal((await documents(api, 'reports')).length, before);
  });

  it('Given reports on a caterer and a review, when the public pages are read, then nothing tells who reported them (L2-054.5)', async () => {
    const api = await startApi();
    const page = await api.client().get('/api/public/caterers/maracas-bay');
    const list = await api.client().get('/api/public/caterers/maracas-bay/reviews');
    for (const body of [page.body, list.body]) {
      assert.equal(JSON.stringify(body).includes('user-priya'), false);
      assert.equal(JSON.stringify(body).includes('R-2041'), false);
    }
  });
});

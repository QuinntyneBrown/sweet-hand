import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi, type Api } from '../support/api.ts';
import { allScenarios } from '../../src/testing/scenarios/index.ts';

const LEAH = 'leah@sweethand.example';
const TOMAS = 'tomas@sweethand.example';
const WEEK = 'from=2026-10-03&to=2026-10-10';

const scenario = (api: Api, name: string) => api.env.db.transaction((tx) => Promise.resolve(allScenarios[name]({ tx, now: api.env.clock.now(), env: api.env }, {})));

describe('query the audit log (L2-060)', () => {
  it('Given the past week, when an Admin reads the log, then entries come newest first with operator, action, target, reason and the change (L2-060.3)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const res = await leah.get(`/api/operator/audit-log?${WEEK}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.total, 9);
    assert.equal(res.body.page, 1);
    assert.equal(res.body.pageSize, 20);
    assert.equal(res.body.anyEntries, true);
    assert.deepEqual(res.body.operators, [
      { id: 'user-leah', name: 'Leah Mohammed' },
      { id: 'user-tomas', name: 'Tomas Reyes' },
    ]);
    assert.deepEqual(res.body.entries.map((e: { id: string }) => e.id), ['aud-1009', 'aud-1008', 'aud-1007', 'aud-1006', 'aud-1005', 'aud-1004', 'aud-1003', 'aud-1002', 'aud-1001']);
    assert.deepEqual(res.body.entries[0], {
      id: 'aud-1009',
      at: '2026-10-10T13:12:00.000Z',
      operatorId: 'user-tomas',
      operatorName: 'Tomas Reyes',
      action: 'HideReview',
      targetType: 'review',
      targetId: 'review-devon-maracas-hidden',
      targetLabel: 'Review of Maracas Bay by Devon W.',
      reason: 'Personal attack on staff, 3 reports',
      before: 'Published',
      after: 'Hidden',
    });
    const label = (id: string) => res.body.entries.find((e: { id: string }) => e.id === id).targetLabel;
    assert.equal(label('aud-1008'), 'Enquiry with Island Pot');
    assert.equal(label('aud-1006'), 'Coconut Drops Bakery');
    assert.equal(label('aud-1003'), 'Breadfruit & Butter');
    assert.equal(label('aud-1002'), 'Report on Sugar Dumplin');
    assert.equal(label('aud-1001'), 'Tomas Reyes');
  });

  it('Given filters by operator, action, target and dates, when an Admin applies them, then only matching entries come back (L2-060.3)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    const ids = async (query: string) => (await leah.get(`/api/operator/audit-log?${query}`)).body.entries.map((e: { id: string }) => e.id);

    assert.deepEqual(await ids(`${WEEK}&operator=user-tomas&action=HideReview`), ['aud-1009']);
    assert.deepEqual(await ids(`${WEEK}&target=coconut%20drops`), ['aud-1006']);
    assert.deepEqual(await ids(`${WEEK}&target=CAT-020`), ['aud-1006']);
    assert.deepEqual(await ids('from=2026-10-09&to=2026-10-09'), ['aud-1007', 'aud-1006']);
    assert.deepEqual(await ids(`${WEEK}&action=resolve-report`), ['aud-1002']);
    assert.deepEqual(await ids(`${WEEK}&action=operator-account,Approve`), ['aud-1006', 'aud-1001']);
    assert.deepEqual(await ids(`${WEEK}&operator=user-tomas&action=Remove`), []);
    assert.equal((await leah.get('/api/operator/audit-log')).body.total, 11);
  });

  it('Given a long log, when an Admin asks for a page, then 20 entries come back with the total (L2-060.3)', async () => {
    const api = await startApi();
    await scenario(api, 'audit-long');
    const leah = await signedInClient(api, LEAH);

    const res = await leah.get('/api/operator/audit-log?from=2025-10-10&to=2026-10-10&page=3');

    assert.equal(res.body.total, 1284);
    assert.equal(res.body.page, 3);
    assert.equal(res.body.entries.length, 20);
    assert.ok(res.body.entries[0].at > res.body.entries[19].at);
    assert.equal((await leah.get('/api/operator/audit-log?page=nonsense')).body.page, 1);
  });

  it('Given a brand-new platform, when an Admin reads the log, then it says there are no entries at all', async () => {
    const api = await startApi();
    await scenario(api, 'audit-empty');
    const leah = await signedInClient(api, LEAH);

    const res = await leah.get(`/api/operator/audit-log?${WEEK}`);

    assert.equal(res.body.total, 0);
    assert.equal(res.body.anyEntries, false);
  });

  it('Given an operator changes the cuisine list, when the log is read, then that change is at the top (L2-060)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    await leah.post('/api/operator/cuisines', { name: 'Caymanian' });

    const res = await leah.get(`/api/operator/audit-log?${WEEK}`);

    const [top] = res.body.entries;
    assert.equal(top.at, '2026-10-10T14:00:00.000Z');
    assert.equal(top.operatorName, 'Leah Mohammed');
    assert.equal(top.action, 'AddCuisine');
    assert.equal(top.targetLabel, 'Caymanian');
    assert.equal(top.before, null);
    assert.equal(top.after, 'Caymanian');
  });

  it('Given an operator without Admin, when they ask for the log, then no log data comes back, they are told who to ask and the attempt is logged (L2-056.5)', async () => {
    const api = await startApi();
    const tomas = await signedInClient(api, TOMAS);

    const res = await tomas.get('/api/operator/audit-log');

    assert.equal(res.status, 403);
    assert.deepEqual(res.body, { title: 'Only Admins can do this', admins: ['Leah Mohammed'] });
    const events = (await documents(api, 'securityEvents')).filter((e) => e.type === 'authorization-failure');
    assert.deepEqual(events.map((e) => [e.userId, e.path]), [['user-tomas', '/api/operator/audit-log']]);
  });

  it('Given any operator, when they try to change or delete an entry, then no such endpoint exists (L2-060.2)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    assert.equal((await leah.put('/api/operator/audit-log/aud-1009', { reason: 'x' })).status, 404);
    assert.equal((await leah.delete('/api/operator/audit-log/aud-1009')).status, 404);
    assert.equal((await documents(api, 'audit')).length, 11);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, signedInClient, startApi } from '../support/api.ts';

const MARCIA = 'marcia.t@example.com';
const ANDRE = 'andre.c@example.com';
const LEAH = 'leah@sweethand.example';

const events = (api: Awaited<ReturnType<typeof startApi>>, type: string) =>
  documents(api, 'securityEvents').then((all) => all.filter((e) => e.type === type).sort((a, b) => a.seq - b.seq));

describe('security events (log-security-events, authorise-requests designs)', () => {
  it('Given another customer’s enquiry, when a customer asks for it, then the answer is the same 404 and the security log records the user, endpoint and target (L2-079.4)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    const id = (await marcia.get('/api/enquiries')).body.items[0].id;
    const andre = await signedInClient(api, ANDRE);
    const res = await andre.get(`/api/enquiries/${id}`);
    assert.equal(res.status, 404);
    assert.deepEqual(res.body, (await andre.get('/api/enquiries/no-such-enquiry')).body);
    const logged = await events(api, 'authorization-failure');
    assert.equal(logged.length, 1, 'only the existing record is a failure; a missing id is not');
    assert.deepEqual([logged[0].userId, logged[0].path, logged[0].targetId], ['user-andre', `/api/enquiries/${id}`, id]);
  });

  it('Given another person’s session, when a customer tries to end it, then it is not found and the attempt is logged (L2-079.4)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    const sessionId = (await marcia.get('/api/me/sessions')).body[0].id;
    const andre = await signedInClient(api, ANDRE);
    assert.equal((await andre.delete(`/api/me/sessions/${sessionId}`)).status, 404);
    assert.equal((await events(api, 'authorization-failure')).at(-1)?.targetId, sessionId);
  });

  it('Given one session, when it is refused 10 times within 5 minutes, then exactly one alert is raised (L2-084.3)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    for (let i = 0; i < 9; i++) assert.equal((await marcia.get('/api/operator/queue')).status, 403);
    assert.deepEqual(await documents(api, 'alerts'), []);
    await marcia.get('/api/operator/queue');
    await marcia.get('/api/operator/queue');
    const alerts = await documents(api, 'alerts');
    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].kind, 'authorization-failures');
    assert.equal(alerts[0].userId, 'user-marcia');
  });

  it('Given failures spread over more than 5 minutes, when they add up to 10, then no alert is raised (L2-084.3)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    for (let i = 0; i < 10; i++) {
      await marcia.get('/api/operator/queue');
      advanceClock(api, 40_000);
    }
    assert.deepEqual(await documents(api, 'alerts'), []);
  });

  it('Given an operator action, when it is saved, then the security log records an operator-action event as well as the audit entry (L2-084.1)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    assert.equal((await leah.post('/api/operator/cuisines', { name: 'Caymanian' })).status, 201);
    const logged = await events(api, 'operator-action');
    assert.equal(logged.length, 1);
    assert.deepEqual([logged[0].userId, logged[0].targetId], ['user-leah', 'caymanian']);
  });

  it('Given a customer with two sessions, when they change their password, then ending the other session is logged (L2-084.1)', async () => {
    const api = await startApi();
    await signedInClient(api, MARCIA);
    const marcia = await signedInClient(api, MARCIA);
    const before = (await events(api, 'session-revoked')).length;
    const res = await marcia.post('/api/me/password', { currentPassword: 'pepperpot-sunday-2026', newPassword: 'a brand new long passphrase 42' });
    assert.ok(res.status < 300, JSON.stringify(res.body));
    const after = await events(api, 'session-revoked');
    assert.equal(after.length, before + 1);
    assert.equal(after.at(-1).userId, 'user-marcia');
  });
});

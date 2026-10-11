import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, outbox, startApi, type Api } from '../support/api.ts';
import { SEED_PASSWORD } from '../../src/seed/users.ts';

const MINUTE = 60_000;
const NEW_PASSWORD = 'callaloo-and-crab-26';

async function requestReset(api: Api, email = 'marcia.t@example.com') {
  return api.client().post('/api/identity/password-reset-requests', { email, challengeToken: 'local:password-reset:1' });
}

async function resetToken(api: Api): Promise<string> {
  await requestReset(api);
  return (await outbox(api)).filter((m) => m.kind === 'password-reset').at(-1)!.link!.slice('/reset-password/'.length);
}

describe('password reset (L2-077, L2-082.3)', () => {
  it('Given any email, registered or not, when a reset is requested, then the answer is the same 202', async () => {
    const api = await startApi();
    const known = await requestReset(api);
    const unknown = await requestReset(api, 'nobody@example.com');
    assert.equal(known.status, 202);
    assert.deepEqual(known.body, unknown.body);
    assert.deepEqual((await outbox(api)).map((m) => [m.to, m.kind]), [['marcia.t@example.com', 'password-reset']]);
    assert.match((await outbox(api))[0].link!, /^\/reset-password\//);
  });

  it('Given a reset link, when it is opened, then it names the account; when it is used, then every session ends and a confirmation is sent', async () => {
    const api = await startApi();
    const signedIn = api.client();
    await signedIn.post('/api/identity/sign-in', { email: 'marcia.t@example.com', password: SEED_PASSWORD });
    const token = await resetToken(api);

    const link = await api.client().get(`/api/identity/password-resets/${token}`);
    assert.deepEqual(link.body, { email: 'marcia.t@example.com' });

    const res = await api.client().post('/api/identity/password-resets', { token, password: NEW_PASSWORD });
    assert.equal(res.status, 204);
    assert.equal((await signedIn.get('/api/session')).body.user, null);
    assert.ok((await outbox(api)).some((m) => m.kind === 'password-changed' && m.to === 'marcia.t@example.com'));
    assert.equal((await api.client().post('/api/identity/sign-in', { email: 'marcia.t@example.com', password: NEW_PASSWORD })).status, 200);

    assert.equal((await api.client().post('/api/identity/password-resets', { token, password: NEW_PASSWORD })).status, 410, 'a second use is refused');
  });

  it('Given a reset link more than 30 minutes old, when it is used, then it is rejected', async () => {
    const api = await startApi();
    const token = await resetToken(api);
    advanceClock(api, 31 * MINUTE);
    assert.equal((await api.client().get(`/api/identity/password-resets/${token}`)).status, 410);
    assert.equal((await api.client().post('/api/identity/password-resets', { token, password: NEW_PASSWORD })).status, 410);
  });

  it('Given a weak new password, when the reset is submitted, then it is refused and the link still works', async () => {
    const api = await startApi();
    const token = await resetToken(api);
    const res = await api.client().post('/api/identity/password-resets', { token, password: 'short' });
    assert.deepEqual(res.body.errors, { password: ['Use 12 to 128 characters'] });
    assert.equal((await api.client().get(`/api/identity/password-resets/${token}`)).status, 200);
  });

  it('Given 5 reset requests from one network in an hour, when the sixth arrives, then it gets 429 with Retry-After', async () => {
    const api = await startApi();
    for (let i = 0; i < 5; i++) assert.equal((await requestReset(api, `x${i}@example.com`)).status, 202);
    const sixth = await requestReset(api);
    assert.equal(sixth.status, 429);
    assert.equal(sixth.headers.get('retry-after'), '3600');
  });
});

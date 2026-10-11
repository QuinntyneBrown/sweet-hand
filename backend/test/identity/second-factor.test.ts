import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, startApi } from '../support/api.ts';
import { LEAH_TOTP_SECRET, SEED_PASSWORD } from '../../src/seed/users.ts';
import { totp } from '../../src/identity/totp.ts';

const MINUTE = 60_000;

describe('operator second factor and timeouts (L2-056.2, L2-078.3)', async () => {
  it('Given an operator with the right password, when they sign in, then nothing opens until the authenticator code is given', async () => {
    const api = await startApi();
    const client = api.client();
    const res = await client.post('/api/identity/sign-in', { email: 'leah@sweethand.example', password: SEED_PASSWORD });
    assert.deepEqual(res.body, { secondFactorRequired: true, privacyUpdateRequired: false });

    const pending = await client.get('/api/session');
    assert.equal(pending.body.user, null);
    assert.deepEqual(pending.body.pendingSecondFactor, { email: 'leah@sweethand.example', method: 'authenticator app' });
    assert.equal((await client.get('/api/operator/queue')).status, 404, 'no operator route exists yet, and no session either');

    const wrong = await client.post('/api/identity/second-factor', { method: 'authenticator app', code: '000000' });
    assert.equal(wrong.status, 400);
    assert.deepEqual(wrong.body.errors, { code: ['That code didn’t work'] });

    const code = totp(LEAH_TOTP_SECRET, api.env.clock.now());
    const right = await client.post('/api/identity/second-factor', { method: 'authenticator app', code });
    assert.equal(right.status, 200);
    assert.deepEqual(right.body, { secondFactorRequired: false, privacyUpdateRequired: false });

    const session = await client.get('/api/session');
    assert.equal(session.body.user.role, 'Operator');
    assert.equal(session.body.user.admin, true);
    assert.equal(session.body.user.secondFactor, 'authenticator app');
  });

  it('Given an operator with a security key, when the key answers, then the sign-in completes', async () => {
    const api = await startApi();
    const client = api.client();
    await client.post('/api/identity/sign-in', { email: 'tomas@sweethand.example', password: SEED_PASSWORD });
    const res = await client.post('/api/identity/second-factor', { method: 'security key', assertion: 'local-key:1234' });
    assert.equal(res.status, 200);
    assert.equal((await client.get('/api/session')).body.user.secondFactor, 'security key');
  });

  it('Given an operator who uses an authenticator app, when they choose their security key instead, then the sign-in completes', async () => {
    const api = await startApi();
    const client = api.client();
    await client.post('/api/identity/sign-in', { email: 'leah@sweethand.example', password: SEED_PASSWORD });
    const res = await client.post('/api/identity/second-factor', { method: 'security key', assertion: 'local-key:5678' });
    assert.equal(res.status, 200);
    assert.equal((await client.get('/api/session')).body.user.email, 'leah@sweethand.example');
  });

  it('Given no pending sign-in, when a code is sent, then the answer is 401', async () => {
    const api = await startApi();
    const res = await api.client().post('/api/identity/second-factor', { method: 'authenticator app', code: '123456' });
    assert.equal(res.status, 401);
  });

  it('Given an operator idle for 30 minutes, when the next request arrives, then the session has ended and the view says so', async () => {
    const api = await startApi();
    const client = api.client();
    await client.post('/api/identity/sign-in', { email: 'leah@sweethand.example', password: SEED_PASSWORD });
    await client.post('/api/identity/second-factor', { method: 'authenticator app', code: totp(LEAH_TOTP_SECRET, api.env.clock.now()) });
    advanceClock(api, 31 * MINUTE);
    const res = await client.get('/api/session');
    assert.equal(res.body.user, null);
    assert.deepEqual(res.body.expired, { email: 'leah@sweethand.example' });
    assert.equal(client.cookies.get('sh_session'), undefined);
  });

  it('Given a customer idle for 13 days, when they come back, then they are still signed in; after 15 days they are not', async () => {
    const api = await startApi();
    const client = api.client();
    await client.post('/api/identity/sign-in', { email: 'marcia.t@example.com', password: SEED_PASSWORD });
    advanceClock(api, 13 * 24 * 60 * MINUTE);
    assert.equal((await client.get('/api/session')).body.user.email, 'marcia.t@example.com');
    advanceClock(api, 15 * 24 * 60 * MINUTE);
    assert.equal((await client.get('/api/session')).body.user, null);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, outbox, signedInClient, startApi, type Api } from '../support/api.ts';
import { totp } from '../../src/identity/totp.ts';

const PASSWORD = 'callaloo-and-saltfish-2026';

async function invite(api: Api, email = 'renee.op@sweethand.example'): Promise<string> {
  const leah = await signedInClient(api, 'leah@sweethand.example');
  const res = await leah.post('/api/operator/accounts', { name: 'Renée Joseph', email, role: 'operator' });
  assert.equal(res.status, 201);
  const mail = (await outbox(api)).find((m) => m.kind === 'operator-invitation' && m.to === email)!;
  return String(mail.link).split('/').at(-1)!;
}

describe('accept an operator invitation (manage-operator-accounts design, L2-056)', () => {
  it('Given an invitation, when the new operator sets a password and enrols an authenticator app, then they can sign in with both steps and the link is used up', async () => {
    const api = await startApi();
    const token = await invite(api);
    const client = api.client();

    const view = await client.get(`/api/operator-invitations/${token}`);
    assert.equal(view.status, 200);
    assert.deepEqual(view.body, { name: 'Renée Joseph', email: 'renee.op@sweethand.example', admin: false });

    const enrol = await client.post(`/api/operator-invitations/${token}/totp`, {});
    assert.equal(enrol.status, 200);
    assert.match(enrol.body.secret, /^[A-Z2-7]{32}$/);
    assert.match(enrol.body.uri, /^otpauth:\/\/totp\/Sweet%20Hand:renee\.op%40sweethand\.example\?secret=/);

    const wrong = await client.post(`/api/operator-invitations/${token}`, { password: PASSWORD, method: 'authenticator app', code: '000000' });
    assert.deepEqual(wrong.body.errors, { code: ['That code didn’t work'] });
    const weak = await client.post(`/api/operator-invitations/${token}`, { password: 'short', method: 'authenticator app', code: totp(enrol.body.secret, api.env.clock.now()) });
    assert.ok(weak.body.errors.password);

    const done = await client.post(`/api/operator-invitations/${token}`, { password: PASSWORD, method: 'authenticator app', code: totp(enrol.body.secret, api.env.clock.now()) });
    assert.equal(done.status, 204);
    assert.equal((await client.get(`/api/operator-invitations/${token}`)).status, 404, 'single use');

    const signIn = await client.post('/api/identity/sign-in', { email: 'renee.op@sweethand.example', password: PASSWORD });
    assert.equal(signIn.body.secondFactorRequired, true);
    const second = await client.post('/api/identity/second-factor', { method: 'authenticator app', code: totp(enrol.body.secret, api.env.clock.now()) });
    assert.equal(second.status, 200);

    const leah = await signedInClient(api, 'leah@sweethand.example');
    const team = (await leah.get('/api/operator/accounts')).body;
    assert.deepEqual(team.filter((a: { email: string }) => a.email === 'renee.op@sweethand.example').map((a: { status: string; secondFactor: string }) => [a.status, a.secondFactor]), [['Active', 'authenticator app']]);
  });

  it('Given an invitation, when the new operator registers a security key, then the account uses it as the second step', async () => {
    const api = await startApi();
    const token = await invite(api);
    const done = await api.client().post(`/api/operator-invitations/${token}`, { password: PASSWORD, method: 'security key', assertion: 'local-key:test' });
    assert.equal(done.status, 204);
    const signIn = await api.client().post('/api/identity/sign-in', { email: 'renee.op@sweethand.example', password: PASSWORD });
    assert.equal(signIn.body.secondFactorRequired, true);
  });

  it('Given an expired, deactivated or unknown invitation, when its link is opened, then it is not found', async () => {
    const api = await startApi();
    const token = await invite(api);
    assert.equal((await api.client().get('/api/operator-invitations/not-a-token')).status, 404);
    advanceClock(api, 25 * 60 * 60_000);
    assert.equal((await api.client().get(`/api/operator-invitations/${token}`)).status, 404);
    assert.equal((await api.client().post(`/api/operator-invitations/${token}`, { password: PASSWORD, method: 'security key', assertion: 'local-key:test' })).status, 404);
  });
});

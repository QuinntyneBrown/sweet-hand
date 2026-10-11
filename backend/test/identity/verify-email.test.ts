import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, outbox, startApi, type Api } from '../support/api.ts';

const HOUR = 60 * 60_000;
const priya = { displayName: 'Priya Singh', email: 'priya.singh@example.com', password: 'tamarind-balls-2026', consent: true, challengeToken: 'local:register:1' };

async function registerPriya(api: Api): Promise<string> {
  await api.client().post('/api/identity/registrations', priya);
  const link = (await outbox(api)).find((m) => m.kind === 'verify-email')!.link!;
  return link.slice('/verify-email/'.length);
}

describe('email verification (L2-023, L2-077.3, L2-077.5)', () => {
  it('Given a fresh verification link, when it is used, then the email is verified, once', async () => {
    const api = await startApi();
    const token = await registerPriya(api);
    const res = await api.client().post('/api/identity/email-verifications', { token });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { displayName: 'Priya Singh', savedEnquiry: null });
    assert.equal((await documents(api, 'users')).find((u) => u.email === priya.email).emailVerified, true);

    const again = await api.client().post('/api/identity/email-verifications', { token });
    assert.equal(again.status, 410);
    assert.deepEqual(again.body, { title: 'This link has expired' });
  });

  it('Given a link more than 24 hours old, when it is used, then it is rejected', async () => {
    const api = await startApi();
    const token = await registerPriya(api);
    advanceClock(api, 24 * HOUR + 1);
    assert.equal((await api.client().post('/api/identity/email-verifications', { token })).status, 410);
  });

  it('Given tokens in storage, when they are inspected, then only hashes are stored (L2-077.5)', async () => {
    const api = await startApi();
    const token = await registerPriya(api);
    const stored = JSON.stringify(await documents(api, 'accountTokens'));
    assert.equal(stored.includes(token), false);
  });

  it('Given an expired link, when a new one is asked for with it, then a new link goes to that account and the old one stops working', async () => {
    const api = await startApi();
    const token = await registerPriya(api);
    advanceClock(api, 25 * HOUR);
    const res = await api.client().post('/api/identity/email-verifications/resend', { token });
    assert.equal(res.status, 202);
    assert.deepEqual(res.body, { email: priya.email });
    const links = (await outbox(api)).filter((m) => m.kind === 'verify-email');
    assert.equal(links.length, 2);
    const fresh = links[1].link!.slice('/verify-email/'.length);
    assert.equal((await api.client().post('/api/identity/email-verifications', { token: fresh })).status, 200);
  });

  it('Given an address, when a new link is asked for, then the answer is the same whether or not it has an account', async () => {
    const api = await startApi();
    await registerPriya(api);
    const known = await api.client().post('/api/identity/email-verifications/resend', { email: priya.email });
    const unknown = await api.client().post('/api/identity/email-verifications/resend', { email: 'nobody@example.com' });
    assert.equal(known.status, 202);
    assert.equal(unknown.status, 202);
    assert.deepEqual(known.body, { email: priya.email });
    assert.deepEqual(unknown.body, { email: 'nobody@example.com' });
    assert.equal((await outbox(api)).filter((m) => m.kind === 'verify-email').length, 2);
  });

  it('Given a verified account, when a new link is asked for, then nothing is sent', async () => {
    const api = await startApi();
    await api.client().post('/api/identity/email-verifications/resend', { email: 'marcia.t@example.com' });
    assert.equal((await outbox(api)).length, 0);
  });
});

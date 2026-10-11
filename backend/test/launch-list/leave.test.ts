import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, startApi, type Api } from '../support/api.ts';
import { confirmed, kendra, marcia, signUp } from './support.ts';

const remove = (api: Api, token: unknown) => api.client().post('/api/launch-list/removals', { token });

describe('leaving the launch list (L2-100)', () => {
  it('Given the confirmed page, when "Remove my email" is used, then the entry, its tokens and queued emails are deleted and the address comes back (L2-100.1, L2-100.4)', async () => {
    const api = await startApi();
    const token = await confirmed(api);
    await signUp(api, kendra);
    const res = await remove(api, token);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { email: marcia.email });
    assert.deepEqual((await documents(api, 'launchList')).map((e) => e.email), [kendra.email]);
    const left = new Set((await documents(api, 'launchList')).map((e) => e.id));
    assert.ok((await documents(api, 'launchListTokens')).every((t) => left.has(t.entryId)));
    assert.ok((await outbox(api)).filter((m) => m.status === 'queued').every((m) => m.to !== marcia.email));
  });

  it('Given a removal link from an email, when the page posts its token, then the Pending entry is deleted (L2-100.3)', async () => {
    const api = await startApi();
    const { remove: token } = await signUp(api);
    assert.deepEqual((await remove(api, token)).body, { email: marcia.email });
    assert.equal((await documents(api, 'launchList')).length, 0);
  });

  it('Given a removal token whose entry is gone, or an unknown token, when it is used, then the reply names no address (L2-100.5)', async () => {
    const api = await startApi();
    const { remove: token } = await signUp(api);
    await remove(api, token);
    const again = await remove(api, token);
    assert.equal(again.status, 200);
    assert.deepEqual(again.body, {});
    assert.deepEqual((await remove(api, 'nonsense')).body, {});
  });

  it('Given a removal link, when a mail scanner fetches it, then nothing is deleted and it redirects to the launch site (leave-launch-list design)', async () => {
    const api = await startApi();
    const { remove: token } = await signUp(api);
    const res = await api.client().get(`/api/launch-list/unsubscribe?token=${token}`);
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('location'), `/?remove=${token}`);
    assert.equal((await documents(api, 'launchList')).length, 1);
  });

  it('Given a one-click POST from a mail client without a CSRF cookie, when it arrives, then the entry is deleted with no body (L2-100.3, L2-104.3)', async () => {
    const api = await startApi();
    const { remove: token } = await signUp(api);
    const res = await fetch(`${api.url}/api/launch-list/unsubscribe?token=${token}`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'List-Unsubscribe=One-Click',
    });
    assert.equal(res.status, 200);
    assert.equal(await res.text(), '');
    assert.equal((await documents(api, 'launchList')).length, 0);
    const unknown = await fetch(`${api.url}/api/launch-list/unsubscribe?token=nope`, { method: 'POST', body: 'List-Unsubscribe=One-Click' });
    assert.equal(unknown.status, 200);
  });

  it('Given no CSRF token, when a page removal arrives, then it is refused with 403 (L2-104.3)', async () => {
    const api = await startApi();
    const res = await fetch(`${api.url}/api/launch-list/removals`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"token":"x"}' });
    assert.equal(res.status, 403);
  });

  it('Given a person removed their address, when they sign up again, then it is a new entry (L2-100.7)', async () => {
    const api = await startApi();
    const token = await confirmed(api);
    await remove(api, token);
    await signUp(api);
    const [entry] = await documents(api, 'launchList');
    assert.equal(entry.status, 'Pending');
  });
});

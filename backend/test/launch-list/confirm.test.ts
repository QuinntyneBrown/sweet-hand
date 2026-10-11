import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, outbox, startApi, type Api } from '../support/api.ts';
import { sweepLaunchList } from '../../src/launch-list/sweep.ts';
import { HOUR, marcia, signUp } from './support.ts';

const confirm = (api: Api, token: unknown) => api.client().post('/api/launch-list/confirmations', { token });

describe('confirming the launch list email (L2-099)', () => {
  it('Given a live confirmation link, when it is confirmed, then the entry is Confirmed with the time recorded and a removal token comes back (L2-099.2)', async () => {
    const api = await startApi();
    const { confirm: token } = await signUp(api);
    advanceClock(api, HOUR);
    const res = await confirm(api, token);
    assert.equal(res.status, 200);
    assert.equal(res.body.email, marcia.email);
    assert.match(res.body.removalToken, /^[0-9a-f]{64}$/);
    const [entry] = await documents(api, 'launchList');
    assert.equal(entry.status, 'Confirmed');
    assert.equal(entry.consent.confirmedAt, '2026-10-10T15:00:00.000Z');
  });

  it('Given a used link, when it is opened again, then it has expired and nothing changes (L2-099.4)', async () => {
    const api = await startApi();
    const { confirm: token } = await signUp(api);
    await confirm(api, token);
    const res = await confirm(api, token);
    assert.equal(res.status, 410);
    assert.equal(res.body.title, 'That link has expired');
  });

  it('Given a link 48 hours old, when it is opened, then it has expired (L2-099.4)', async () => {
    const api = await startApi();
    const { confirm: token } = await signUp(api);
    advanceClock(api, 48 * HOUR);
    assert.equal((await confirm(api, token)).status, 410);
    assert.equal((await documents(api, 'launchList'))[0].status, 'Pending');
  });

  it('Given an unknown or malformed token, when it is opened, then it has expired', async () => {
    const api = await startApi();
    assert.equal((await confirm(api, 'a'.repeat(64))).status, 410);
    assert.equal((await confirm(api, { $ne: null })).status, 410);
  });

  it('Given no CSRF token, when a confirmation arrives, then it is refused with 403 (L2-104.3)', async () => {
    const api = await startApi();
    const res = await fetch(`${api.url}/api/launch-list/confirmations`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"token":"x"}' });
    assert.equal(res.status, 403);
  });

  it('Given one IP made 30 confirm requests in an hour, when the next arrives, then it gets 429 (L2-104.5)', async () => {
    const api = await startApi();
    for (let i = 0; i < 30; i++) assert.equal((await confirm(api, 'x')).status, 410);
    const res = await confirm(api, 'x');
    assert.equal(res.status, 429);
    assert.ok(res.headers.get('retry-after'));
  });

  it('Given a Pending entry whose last confirmation email is over 48 hours old, when the hourly sweep runs, then it, its tokens and its queued emails are deleted (L2-099.5)', async () => {
    const api = await startApi();
    await signUp(api);
    await signUp(api, { ...marcia, email: 'kept@example.com' });
    const { confirm: token } = await signUp(api, { ...marcia, email: 'confirmed@example.com' });
    await confirm(api, token);
    advanceClock(api, 47 * HOUR);
    await signUp(api, { ...marcia, email: 'kept@example.com' });
    advanceClock(api, 2 * HOUR);
    assert.equal(await sweepLaunchList(api.env), 1);
    assert.deepEqual((await documents(api, 'launchList')).map((e) => e.email).sort(), ['confirmed@example.com', 'kept@example.com']);
    const ids = new Set((await documents(api, 'launchList')).map((e) => e.id));
    assert.ok((await documents(api, 'launchListTokens')).every((t) => ids.has(t.entryId)));
    assert.ok((await outbox(api)).every((m) => m.to !== marcia.email));
  });
});

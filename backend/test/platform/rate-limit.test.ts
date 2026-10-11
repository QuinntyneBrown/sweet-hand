import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, signedInClient, startApi } from '../support/api.ts';

describe('public read rate limit (L2-082.1)', () => {
  it('Given one address sends more than 300 public reads in a minute, when the limit is passed, then further reads get 429 with Retry-After until the window resets', async () => {
    const api = await startApi();
    const client = api.client();
    const statuses = [];
    for (let i = 0; i < 301; i++) statuses.push((await client.get('/api/public/cuisines')).status);
    assert.equal(statuses.filter((s) => s === 200).length, 300);
    const blocked = await client.get('/api/public/cuisines');
    assert.equal(blocked.status, 429);
    assert.equal(blocked.headers.get('retry-after'), '60');
    assert.equal(blocked.body.title, 'Too many requests');
    assert.equal((await client.get('/api/session')).status, 429, 'every anonymous read counts');
    const marcia = await signedInClient(api, 'marcia.t@example.com');
    assert.equal((await marcia.get('/api/me/sessions')).status, 200, 'signed-in endpoints are not counted');

    advanceClock(api, 60_000);
    assert.equal((await client.get('/api/public/cuisines')).status, 200);
  });

  it('Given one address has used up its public reads, when it reports a visit, then the visit beacon is limited too (count-visits design)', async () => {
    const api = await startApi();
    const client = api.client();
    for (let i = 0; i < 300; i++) await client.post('/api/visits', { pageType: 'Listing' });
    assert.equal((await client.post('/api/visits', { pageType: 'Listing' })).status, 429);
    assert.equal((await client.get('/api/public/cuisines')).status, 429, 'visits and reads share the limit');
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, signedInClient, startApi } from '../support/api.ts';

describe('owner’s certificate copy (provide-food-handler-certificate design, L2-040.4)', () => {
  it('Given a caterer with a certificate copy, when they open it, then they get a link that only they can use and that stops working after 5 minutes', async () => {
    const api = await startApi();
    const owner = (await documents(api, 'caterers')).find((c) => c.certificate?.fileName && c.ownerUserId);
    assert.ok(owner, 'the cast has an owner with a certificate copy');
    const user = (await documents(api, 'users')).find((u) => u.id === owner.ownerUserId);
    const caterer = await signedInClient(api, user.email);

    const res = await caterer.get('/api/caterer/profile/certificate/file-url');
    assert.equal(res.status, 302);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    const location = res.headers.get('location')!;
    assert.match(location, /^\/api\/caterer\/certificate-files\/[0-9a-f]{32}\?expires=/);
    const file = await caterer.get(location);
    assert.equal(file.status, 200);
    assert.equal(file.headers.get('cache-control'), 'no-store');

    const other = await signedInClient(api, user.id === 'user-vishnu' ? 'kendra@pelauhouse.example' : 'vishnu@maracasbay.example');
    assert.equal((await other.get(location)).status, 404, 'another caterer');
    advanceClock(api, 5 * 60_000 + 1000);
    assert.equal((await caterer.get(location)).status, 404, 'an expired link');
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, startApi } from '../support/api.ts';
import { SEED_PASSWORD } from '../../src/seed/users.ts';
import { publishPrivacyNotice } from '../../src/identity/privacy.ts';

describe('privacy notice and consent (L2-070)', () => {
  it('Given anyone, when they ask for the privacy notice, then they get the current version', async () => {
    const api = await startApi();
    const res = await api.client().get('/api/public/privacy-notice');
    assert.deepEqual(res.body, { version: '2026-03', effectiveDate: '2026-03-01', changes: [] });
  });

  it('Given a substantially different notice, when an existing user signs in, then they must accept it first; accepting records the version and time', async () => {
    const api = await startApi();
    await api.env.db.transaction((tx) =>
      publishPrivacyNotice(tx, { version: '2026-11', effectiveDate: '2026-11-01', substantialChange: true, changes: ['We now use a Canadian email provider.'] }),
    );
    const client = api.client();
    const signIn = await client.post('/api/identity/sign-in', { email: 'marcia.t@example.com', password: SEED_PASSWORD });
    assert.equal(signIn.body.privacyUpdateRequired, true);
    assert.equal((await client.get('/api/session')).body.privacyUpdateRequired, true);

    const stale = await client.post('/api/me/consents', { version: '2026-03' });
    assert.deepEqual(stale.body.errors, { version: ['Accept the current privacy notice'] });

    assert.equal((await client.post('/api/me/consents', { version: '2026-11' })).status, 204);
    const marcia = (await documents(api, 'users')).find((u) => u.id === 'user-marcia');
    assert.equal(marcia.acceptedPrivacyVersion, '2026-11');
    assert.equal(marcia.acceptedPrivacyAt, '2026-10-10T14:00:00.000Z');
    assert.equal((await client.get('/api/session')).body.privacyUpdateRequired, undefined);
  });

  it('Given a visitor, when they send a consent, then they must sign in', async () => {
    const api = await startApi();
    assert.equal((await api.client().post('/api/me/consents', { version: '2026-03' })).status, 401);
  });
});

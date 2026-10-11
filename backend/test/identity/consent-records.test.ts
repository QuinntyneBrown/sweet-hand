import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi } from '../support/api.ts';
import { publishPrivacyNotice } from '../../src/identity/privacy.ts';

const REGISTER = '/api/identity/registrations';

describe('consent records and the consent gate (consent-to-privacy-notice design, L2-070)', () => {
  it('Given an account that owes re-consent, when it calls any other endpoint, then it is refused until it accepts, and the acceptance is added as a record (L2-070.3, L2-070.4)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');
    await api.env.db.transaction((tx) =>
      publishPrivacyNotice(tx, { version: '2026-11', effectiveDate: '2026-11-01', substantialChange: true, changes: ['We now use a Canadian email provider.'] }),
    );

    const refused = await marcia.get('/api/me/account');
    assert.equal(refused.status, 403);
    assert.equal(refused.body.type, 'privacy-update-required');
    assert.equal((await marcia.get('/api/session')).status, 200);
    assert.equal((await marcia.get('/api/public/privacy-notice')).status, 200);

    assert.equal((await marcia.post('/api/me/consents', { version: '2026-11' })).status, 204);
    assert.equal((await marcia.get('/api/me/account')).status, 200);
    const records = (await documents(api, 'consents')).filter((c) => c.userId === 'user-marcia');
    assert.deepEqual(records.map((c) => [c.noticeVersion, c.acceptedAt]), [['2026-11', api.env.clock.now().toISOString()]]);
  });

  it('Given a new account, when it registers, then a consent record exists for the notice it accepted (L2-070.3)', async () => {
    const api = await startApi();
    const res = await api.client().post(REGISTER, { displayName: 'Ruthie Baptiste', email: 'ruthie.b@example.com', password: 'sorrel-and-black-cake-2026', consent: true, challengeToken: 'local:register:1' });
    assert.ok(res.status < 300, JSON.stringify(res.body));
    const user = (await documents(api, 'users')).find((u) => u.emailKey === 'ruthie.b@example.com');
    assert.deepEqual((await documents(api, 'consents')).filter((c) => c.userId === user.id).map((c) => c.noticeVersion), ['2026-03']);
  });
});

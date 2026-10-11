import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, startApi, type Api } from '../support/api.ts';

const send = (api: Api, body: unknown, token = 'local:email-events:1') =>
  fetch(`${api.url}/api/email-events`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-email-events-token': token }, body: JSON.stringify(body) });
const marcia = async (api: Api) => (await documents(api, 'users')).find((u) => u.id === 'user-marcia');

describe('email bounces (notify-enquiry-activity design, L2-030.3)', () => {
  it('Given a permanent bounce from the email provider, when it is reported, then the account is marked undeliverable', async () => {
    const api = await startApi();
    const res = await send(api, { type: 'bounce', bounce: 'permanent', email: 'Marcia.T@example.com' });
    assert.equal(res.status, 204);
    assert.equal((await marcia(api)).emailBounced, true);
  });

  it('Given a temporary failure, when it is reported, then nothing changes', async () => {
    const api = await startApi();
    assert.equal((await send(api, { type: 'bounce', bounce: 'temporary', email: 'marcia.t@example.com' })).status, 204);
    assert.equal((await marcia(api)).emailBounced, undefined);
  });

  it('Given a report without the provider’s token, when it arrives, then it is refused and nothing changes', async () => {
    const api = await startApi();
    assert.equal((await send(api, { type: 'bounce', bounce: 'permanent', email: 'marcia.t@example.com' }, 'forged')).status, 401);
    assert.equal((await marcia(api)).emailBounced, undefined);
  });
});

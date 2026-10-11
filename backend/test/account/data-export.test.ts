import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, signedInClient, startApi } from '../support/api.ts';

describe('data export request (L2-071)', () => {
  it('Given a signed-in customer, when they request an export, then it is recorded for them and the account shows it in progress', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');

    const res = await marcia.post('/api/me/data-exports', {});

    assert.equal(res.status, 202);
    assert.deepEqual(res.body.dataExport, { requestedAt: '2026-10-10T14:00:00.000Z' });
    assert.deepEqual((await marcia.get('/api/me/account')).body.dataExport, { requestedAt: '2026-10-10T14:00:00.000Z' });
    const [request] = await documents(api, 'dataExports');
    assert.equal(request.userId, 'user-marcia');
    assert.equal(request.status, 'Requested');
  });

  it('Given an export already being prepared, when another is requested, then the first request stands', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');
    await marcia.post('/api/me/data-exports', {});
    advanceClock(api, 60_000);

    const again = await marcia.post('/api/me/data-exports', {});

    assert.deepEqual(again.body.dataExport, { requestedAt: '2026-10-10T14:00:00.000Z' });
    assert.equal((await documents(api, 'dataExports')).length, 1);
  });

  it('Given another user’s export request, when someone else opens their account, then they see none', async () => {
    const api = await startApi();
    await (await signedInClient(api, 'marcia.t@example.com')).post('/api/me/data-exports', {});
    const andre = await signedInClient(api, 'andre.c@example.com');
    assert.equal((await andre.get('/api/me/account')).body.dataExport, null);
  });
});

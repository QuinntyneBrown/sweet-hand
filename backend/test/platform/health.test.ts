import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startApi } from '../support/api.ts';
import { testEnvironment } from '../../src/environment.ts';

describe('health checks (L2-088)', async () => {
  it('Given a running instance, when /health/live is requested, then it answers 200', async () => {
    const api = await startApi();
    const res = await api.client().get('/health/live');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'live' });
  });

  it('Given the database is reachable, when /health/ready is requested, then it answers 200', async () => {
    const api = await startApi();
    const res = await api.client().get('/health/ready');
    assert.equal(res.status, 200);
  });

  it('Given the instance cannot reach its database, when /health/ready is requested, then it answers 503 (L2-088.3)', async () => {
    const env = await testEnvironment();
    env.db.ping = async () => false;
    const api = await startApi({ env });
    const res = await api.client().get('/health/ready');
    assert.equal(res.status, 503);
  });
});

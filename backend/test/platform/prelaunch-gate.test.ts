// Acceptance Test
// Traces to: L2-108
// Description: Pre-launch production exposes only the launch-list HTTP surface.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { startApi } from '../support/api.ts';

test('pre-launch mode serves the launch-list status and platform health', async () => {
  const api = await startApi({ config: { prelaunchMode: true } });
  assert.equal((await api.client().get('/api/public/launch-list')).status, 200);
  assert.equal((await api.client().get('/health/live')).status, 200);
  assert.equal((await api.client().get('/health/ready')).status, 200);
});

test('pre-launch mode conceals product and administration endpoints', async () => {
  const api = await startApi({ config: { prelaunchMode: true } });
  assert.equal((await api.client().get('/api/caterers')).status, 404);
  assert.equal((await api.client().post('/api/identity/sign-in', {})).status, 404);
  assert.equal((await api.client().get('/api/admin/metrics')).status, 404);
});

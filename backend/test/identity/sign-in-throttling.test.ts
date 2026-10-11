import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, outbox, startApi } from '../support/api.ts';
import { SEED_PASSWORD } from '../../src/seed/users.ts';

const MINUTE = 60_000;

describe('sign-in throttling (L2-076.4, L2-076.5, L2-082.2)', () => {
  it('Given 5 failed sign-ins for one account within 15 minutes, when a sixth is attempted, then it is paused for 15 minutes whatever the password and the owner is emailed', async () => {
    const api = await startApi();
    const client = api.client();
    for (let i = 0; i < 5; i++) {
      const res = await client.post('/api/identity/sign-in', { email: 'marcia.t@example.com', password: 'wrong-password-123' });
      assert.equal(res.status, 401);
    }
    const sixth = await client.post('/api/identity/sign-in', { email: 'marcia.t@example.com', password: SEED_PASSWORD });
    assert.equal(sixth.status, 423);
    assert.deepEqual(sixth.body, { title: 'Sign-in is paused for this account', lockedUntil: '2026-10-10T14:15:00.000Z' });
    assert.deepEqual(
      (await outbox(api)).map((m) => [m.to, m.kind]),
      [['marcia.t@example.com', 'sign-in-paused']],
    );

    advanceClock(api, 15 * MINUTE + 1);
    const later = await client.post('/api/identity/sign-in', { email: 'marcia.t@example.com', password: SEED_PASSWORD });
    assert.equal(later.status, 200);
  });

  it('Given failures spread over more than 15 minutes, when the fifth arrives, then the account is not paused', async () => {
    const api = await startApi();
    const client = api.client();
    for (let i = 0; i < 4; i++) await client.post('/api/identity/sign-in', { email: 'andre.c@example.com', password: 'wrong-password-123' });
    advanceClock(api, 16 * MINUTE);
    await client.post('/api/identity/sign-in', { email: 'andre.c@example.com', password: 'wrong-password-123' });
    const res = await client.post('/api/identity/sign-in', { email: 'andre.c@example.com', password: SEED_PASSWORD });
    assert.equal(res.status, 200);
  });

  it('Given 20 failed sign-ins from one network within 15 minutes, when another arrives without a challenge, then a bot-protection check is required first', async () => {
    const api = await startApi();
    const client = api.client();
    for (let i = 0; i < 20; i++) await client.post('/api/identity/sign-in', { email: `nobody${i}@example.com`, password: 'wrong-password-123' });
    const blocked = await client.post('/api/identity/sign-in', { email: 'devon.w@example.com', password: SEED_PASSWORD });
    assert.equal(blocked.status, 400);
    assert.deepEqual(blocked.body, { title: 'Confirm you’re a person', challengeRequired: true });

    const passed = await client.post('/api/identity/sign-in', { email: 'devon.w@example.com', password: SEED_PASSWORD, challengeToken: 'local:sign-in:abc' });
    assert.equal(passed.status, 200);
  });
});

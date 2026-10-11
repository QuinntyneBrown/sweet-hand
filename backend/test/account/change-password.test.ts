import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, signedInClient, startApi } from '../support/api.ts';
import { SEED_PASSWORD } from '../../src/seed/users.ts';

const NEW_PASSWORD = 'pepperpot-sundays-21';

describe('change password (L2-076.1, L2-076.2)', () => {
  it('Given the right current password and a strong new one, when it is changed, then this device stays signed in, the others are signed out and a confirmation is emailed', async () => {
    const api = await startApi();
    const other = await signedInClient(api, 'marcia.t@example.com');
    const marcia = await signedInClient(api, 'marcia.t@example.com');

    const res = await marcia.post('/api/me/password', { currentPassword: SEED_PASSWORD, newPassword: NEW_PASSWORD });

    assert.equal(res.status, 204);
    assert.equal((await marcia.get('/api/session')).body.user.email, 'marcia.t@example.com');
    assert.equal((await other.get('/api/session')).body.user, null);
    assert.deepEqual((await marcia.get('/api/me/sessions')).body.length, 1, 'the seeded devices are signed out too');
    assert.equal((await marcia.get('/api/me/account')).body.passwordChangedAt, '2026-10-10T14:00:00.000Z');
    assert.deepEqual((await outbox(api)).map((m) => [m.to, m.kind]), [['marcia.t@example.com', 'password-changed']]);
    assert.ok((await documents(api, 'securityEvents')).some((e) => e.type === 'password-change' && e.userId === 'user-marcia'));
    assert.equal((await api.client().post('/api/identity/sign-in', { email: 'marcia.t@example.com', password: NEW_PASSWORD })).status, 200);
    assert.equal((await api.client().post('/api/identity/sign-in', { email: 'marcia.t@example.com', password: SEED_PASSWORD })).status, 401);
  });

  it('Given the stored credential, when the password was changed, then it is an Argon2id hash, never the password (L2-076.2)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');
    await marcia.post('/api/me/password', { currentPassword: SEED_PASSWORD, newPassword: NEW_PASSWORD });
    const user = (await documents(api, 'users')).find((u) => u.id === 'user-marcia');
    assert.match(user.passwordHash, /^\$argon2id\$/);
    assert.equal(JSON.stringify(await documents(api, 'users')).includes(NEW_PASSWORD), false);
  });

  it('Given a wrong current password, when a change is tried, then it is refused and nothing changes', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');

    const res = await marcia.post('/api/me/password', { currentPassword: 'not-my-password', newPassword: NEW_PASSWORD });

    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { currentPassword: ['That password isn’t right'] });
    assert.equal((await marcia.get('/api/me/sessions')).body.length, 3);
    assert.deepEqual(await outbox(api), []);
  });

  it('Given a breached or short new password, when a change is tried, then it is refused with the rule (L2-076.1)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');
    const breached = await marcia.post('/api/me/password', { currentPassword: SEED_PASSWORD, newPassword: 'sunshine2026' });
    assert.deepEqual(breached.body.errors, { newPassword: ['This password is too common'] });
    const short = await marcia.post('/api/me/password', { currentPassword: SEED_PASSWORD, newPassword: 'short' });
    assert.deepEqual(short.body.errors, { newPassword: ['Use 12 to 128 characters'] });
  });
});

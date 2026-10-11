import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startApi } from '../support/api.ts';
import { SEED_PASSWORD } from '../../src/seed/users.ts';

describe('sign in (L2-076, L2-078)', async () => {
  const api = await startApi();

  it('Given a visitor, when they ask for the session, then there is no user', async () => {
    const res = await api.client().get('/api/session');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { user: null, unread: 0, queueCount: 0 });
  });

  it('Given a customer with the right password, when they sign in, then an HttpOnly session cookie is set and the session names them', async () => {
    const client = api.client();
    const res = await client.post('/api/identity/sign-in', { email: 'Marcia.T@example.com ', password: SEED_PASSWORD });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { secondFactorRequired: false, privacyUpdateRequired: false });
    const cookie = res.headers.getSetCookie().find((c) => c.startsWith('sh_session='))!;
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Lax/);
    // An opaque identifier of at least 128 bits (L2-078.1).
    assert.ok(client.cookies.get('sh_session')!.length >= 32);

    const session = await client.get('/api/session');
    assert.equal(session.body.user.email, 'marcia.t@example.com');
    assert.equal(session.body.user.role, 'Customer');
    assert.equal(session.body.user.displayName, 'Marcia Thompson');
    assert.equal(session.body.user.admin, false);
    assert.equal(session.body.user.emailVerified, true);
  });

  it('Given an unknown email and a wrong password, when each is tried, then the status and message are the same (L2-076.3)', async () => {
    const unknown = await api.client().post('/api/identity/sign-in', { email: 'nobody@example.com', password: SEED_PASSWORD });
    const wrong = await api.client().post('/api/identity/sign-in', { email: 'andre.c@example.com', password: 'not-the-password' });
    assert.equal(unknown.status, 401);
    assert.deepEqual(unknown.body, wrong.body);
    assert.equal(wrong.status, 401);
    assert.deepEqual(wrong.body, { title: 'Email or password is incorrect' });
  });

  it('Given a session from before sign-in, when the user signs in, then the old identifier is replaced (L2-078.2)', async () => {
    const client = api.client();
    await client.post('/api/identity/sign-in', { email: 'andre.c@example.com', password: SEED_PASSWORD });
    const before = client.cookies.get('sh_session');
    await client.post('/api/identity/sign-in', { email: 'andre.c@example.com', password: SEED_PASSWORD });
    assert.notEqual(client.cookies.get('sh_session'), before);
    const replay = api.client();
    replay.cookies.set('sh_session', before!);
    assert.equal((await replay.get('/api/session')).body.user, null);
  });

  it('Given a signed-in user, when they sign out, then replaying the old cookie is unauthenticated (L2-078.4)', async () => {
    const client = api.client();
    await client.post('/api/identity/sign-in', { email: 'devon.w@example.com', password: SEED_PASSWORD });
    const token = client.cookies.get('sh_session')!;
    const out = await client.post('/api/identity/sign-out');
    assert.equal(out.status, 204);
    assert.equal(client.cookies.get('sh_session'), undefined);
    const replay = api.client();
    replay.cookies.set('sh_session', token);
    assert.equal((await replay.get('/api/session')).body.user, null);
  });

  it('Given stored passwords, when the credential store is inspected, then each is an Argon2id hash with its own salt (L2-076.2)', async () => {
    const client = api.client();
    await client.post('/api/identity/sign-in', { email: 'marcia.t@example.com', password: SEED_PASSWORD });
    const users = await api.env.db.transaction((tx) => tx.collection<{ id: string; passwordHash: string }>('users').all());
    for (const u of users) assert.match(u.passwordHash, /^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    assert.equal(new Set(users.map((u) => u.passwordHash)).size, users.length);
  });
});

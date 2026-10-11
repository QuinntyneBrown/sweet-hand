import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, signedInClient, startApi } from '../support/api.ts';
import { SEED_PASSWORD } from '../../src/seed/users.ts';

const LEAH = 'leah@sweethand.example';
const TOMAS = 'tomas@sweethand.example';
const NOW = '2026-10-10T14:00:00.000Z';

describe('manage operator accounts (L2-056)', () => {
  it('Given the operator team, when an Admin lists it, then each operator shows role, second step and last activity, their own row marked', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const res = await leah.get('/api/operator/accounts');

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, [
      { id: 'user-leah', name: 'Leah Mohammed', initials: 'LM', email: LEAH, admin: true, secondFactor: 'authenticator app', status: 'Active', lastActiveAt: NOW, deactivatedAt: null, self: true },
      { id: 'user-tomas', name: 'Tomas Reyes', initials: 'TR', email: TOMAS, admin: false, secondFactor: 'security key', status: 'Active', lastActiveAt: '2026-10-10T12:15:00.000Z', deactivatedAt: null, self: false },
    ]);
  });

  it('Given an operator who has signed in since, when an Admin lists the team, then their last activity comes from their session', async () => {
    const api = await startApi();
    await signedInClient(api, TOMAS);
    api.env.clock.advance(5 * 60_000);
    const leah = await signedInClient(api, LEAH);

    const res = await leah.get('/api/operator/accounts');

    assert.equal(res.body[1].lastActiveAt, NOW);
  });

  it('Given an operator without Admin, when they ask for the team, then the answer is 403 naming who to ask, and the attempt is a security event (L2-056.3, L2-056.5)', async () => {
    const api = await startApi();
    const tomas = await signedInClient(api, TOMAS);

    const res = await tomas.get('/api/operator/accounts');

    assert.equal(res.status, 403);
    assert.deepEqual(res.body, { title: 'Only Admins can do this', admins: ['Leah Mohammed'] });
    const events = (await documents(api, 'securityEvents')).filter((e) => e.type === 'authorization-failure');
    assert.equal(events.length, 1);
    assert.equal(events[0].userId, 'user-tomas');
    assert.equal(events[0].path, '/api/operator/accounts');
  });

  it('Given a customer, when they ask for the team, then the refusal names nobody', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');

    const res = await marcia.get('/api/operator/accounts');

    assert.equal(res.status, 403);
    assert.equal(res.body.admins, undefined);
  });

  it('Given an Admin invites an operator, when it is saved, then the invitation is listed, emailed with a single-use link stored only as a hash, and audited', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const res = await leah.post('/api/operator/accounts', { name: ' Ayesha  Khan ', email: 'Ayesha.Khan@sweethand.example', role: 'operator', admin: true });

    assert.equal(res.status, 201);
    assert.match(res.body.id, /^op-/);
    assert.deepEqual({ ...res.body, id: undefined }, {
      id: undefined,
      name: 'Ayesha Khan',
      initials: 'AK',
      email: 'ayesha.khan@sweethand.example',
      admin: false,
      secondFactor: null,
      status: 'Invited',
      invitedAt: NOW,
      deactivatedAt: null,
      self: false,
    });
    const list = await leah.get('/api/operator/accounts');
    assert.deepEqual(list.body.map((a: { name: string; status: string }) => `${a.name} ${a.status}`), ['Leah Mohammed Active', 'Tomas Reyes Active', 'Ayesha Khan Invited']);
    const [mail] = await outbox(api);
    assert.equal(mail.to, 'ayesha.khan@sweethand.example');
    assert.equal(mail.kind, 'operator-invitation');
    const token = mail.link!.split('/').at(-1)!;
    assert.ok(token.length >= 32);
    const [stored] = await documents(api, 'operatorInvitations');
    assert.equal(JSON.stringify(stored).includes(token), false);
    assert.equal(stored.expiresAt, '2026-10-11T14:00:00.000Z');
    const entry = (await documents(api, 'audit')).find((e) => e.action === 'CreateOperator');
    assert.deepEqual([entry.operatorId, entry.targetType, entry.targetId, entry.before, entry.after], ['user-leah', 'operator', res.body.id, null, 'Operator']);
  });

  it('Given missing, malformed or taken entries, when an invitation is sent, then each is refused by field and nothing is created (L2-068.3)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    await leah.post('/api/operator/accounts', { name: 'Ayesha Khan', email: 'ayesha.khan@sweethand.example', role: 'admin' });

    const blank = await leah.post('/api/operator/accounts', { name: '', email: '', role: 'boss' });
    const malformed = await leah.post('/api/operator/accounts', { name: 'A', email: 'ayesha.khan@sweethand', role: 'operator' });
    const taken = await leah.post('/api/operator/accounts', { name: 'A', email: 'TOMAS@sweethand.example', role: 'operator' });
    const invited = await leah.post('/api/operator/accounts', { name: 'A', email: 'ayesha.khan@sweethand.example', role: 'operator' });

    assert.deepEqual(blank.body.errors, { name: ['Enter their full name'], email: ['Enter their work email'], role: ['Choose a role'] });
    assert.deepEqual(malformed.body.errors, { email: ['Enter an email address like name@example.com'] });
    assert.deepEqual(taken.body.errors, { email: ['This email already has a Sweet Hand account'] });
    assert.deepEqual(invited.body.errors, { email: ['This email already has a Sweet Hand account'] });
    assert.equal((await documents(api, 'operatorInvitations')).length, 1);
  });

  it('Given an operator without Admin, when they invite or deactivate, then both are refused with 403', async () => {
    const api = await startApi();
    const tomas = await signedInClient(api, TOMAS);

    assert.equal((await tomas.post('/api/operator/accounts', { name: 'A B', email: 'a@b.example', role: 'admin' })).status, 403);
    assert.equal((await tomas.post('/api/operator/accounts/user-leah/deactivate')).status, 403);
    assert.equal((await documents(api, 'operatorInvitations')).length, 0);
  });

  it('Given an Admin deactivates an operator, when it is saved, then their sessions end at once, they cannot sign in again, and it is audited once (L2-056.4)', async () => {
    const api = await startApi();
    const tomas = await signedInClient(api, TOMAS);
    const leah = await signedInClient(api, LEAH);

    const res = await leah.post('/api/operator/accounts/user-tomas/deactivate');
    const again = await leah.post('/api/operator/accounts/user-tomas/deactivate');

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'Deactivated');
    assert.equal(res.body.deactivatedAt, NOW);
    assert.equal(again.status, 200);
    assert.equal((await tomas.get('/api/operator/cuisines')).status, 401);
    assert.equal((await documents(api, 'sessions')).some((s) => s.userId === 'user-tomas'), false);
    const signIn = await api.client().post('/api/identity/sign-in', { email: TOMAS, password: SEED_PASSWORD });
    assert.notEqual(signIn.status, 200);
    const list = await leah.get('/api/operator/accounts');
    assert.deepEqual(list.body.map((a: { id: string; status: string }) => `${a.id} ${a.status}`), ['user-leah Active', 'user-tomas Deactivated']);
    const entries = (await documents(api, 'audit')).filter((e) => e.action === 'DeactivateOperator');
    assert.equal(entries.length, 1);
    assert.deepEqual([entries[0].operatorId, entries[0].targetId, entries[0].before, entries[0].after], ['user-leah', 'user-tomas', 'Operator', 'Deactivated']);
  });

  it('Given a pending invitation, when an Admin deactivates it, then it is listed as deactivated', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    const invite = await leah.post('/api/operator/accounts', { name: 'Ayesha Khan', email: 'ayesha.khan@sweethand.example', role: 'operator' });

    const res = await leah.post(`/api/operator/accounts/${invite.body.id}/deactivate`);

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'Deactivated');
    const entry = (await documents(api, 'audit')).find((e) => e.action === 'DeactivateOperator');
    assert.equal(entry.before, 'Invited');
  });

  it('Given an Admin, when they deactivate themselves, someone unknown or a customer, then it is refused', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const self = await leah.post('/api/operator/accounts/user-leah/deactivate');
    const unknown = await leah.post('/api/operator/accounts/user-nobody/deactivate');
    const customer = await leah.post('/api/operator/accounts/user-marcia/deactivate');

    assert.equal(self.status, 409);
    assert.equal(self.body.title, 'You can’t deactivate your own account');
    assert.equal(unknown.status, 404);
    assert.equal(customer.status, 404);
  });
});

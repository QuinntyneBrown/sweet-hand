import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, signedInClient, startApi } from '../support/api.ts';

const MARCIA = { displayName: 'Marcia Thompson', email: 'marcia.t@example.com', phone: '+1 647 555 0187' };

describe('edit details (account page, L2-077.3)', () => {
  it('Given a signed-in customer, when they save a new phone number, then it is stored in one format and the account comes back', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA.email);

    const res = await marcia.put('/api/me/details', { ...MARCIA, phone: '647-555-0123' });

    assert.equal(res.status, 200);
    assert.equal(res.body.phone, '+1 647 555 0123');
    assert.equal(res.body.emailVerified, true);
    assert.equal((await documents(api, 'users')).find((u) => u.id === 'user-marcia').phone, '+1 647 555 0123');
    assert.deepEqual(await outbox(api), [], 'no email when the address is unchanged');
  });

  it('Given an empty phone, when the details are saved, then the phone is removed', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA.email);
    const res = await marcia.put('/api/me/details', { ...MARCIA, phone: null });
    assert.equal(res.body.phone, null);
  });

  it('Given a new email address, when the details are saved, then it must be verified again and a link goes to it (L2-077.3)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA.email);

    const res = await marcia.put('/api/me/details', { ...MARCIA, email: 'marcia.thompson@example.com' });

    assert.equal(res.body.email, 'marcia.thompson@example.com');
    assert.equal(res.body.emailVerified, false);
    assert.equal(res.body.verificationSentAt, '2026-10-10T14:00:00.000Z');
    assert.deepEqual((await outbox(api)).map((m) => [m.to, m.kind]), [['marcia.thompson@example.com', 'verify-email']]);
    assert.equal((await api.client().post('/api/identity/sign-in', { email: 'marcia.thompson@example.com', password: 'pepperpot-sunday-2026' })).status, 200);
  });

  it('Given an address whose emails bounced, when a new one is saved, then the bounce is cleared', async () => {
    const api = await startApi();
    await api.env.db.transaction(async (tx) => {
      const users = tx.collection<any>('users');
      await users.put({ ...(await users.get('user-marcia')), emailBounced: true });
    });
    const marcia = await signedInClient(api, MARCIA.email);
    const res = await marcia.put('/api/me/details', { ...MARCIA, email: 'marcia.thompson@example.com' });
    assert.equal(res.body.emailBounced, false);
  });

  it('Given invalid details, when they are saved, then each problem is named on its field and nothing changes', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA.email);

    const res = await marcia.put('/api/me/details', { displayName: 'M', email: 'marcia.t@example', phone: '555-01' });

    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, {
      name: ['Enter a display name of 2 to 50 characters'],
      email: ['Enter an email address like name@example.com'],
      phone: ['Enter a 10-digit Canadian phone number'],
    });
    assert.equal((await documents(api, 'users')).find((u) => u.id === 'user-marcia').displayName, 'Marcia Thompson');
  });

  it('Given an email another account uses, when it is saved, then it is refused', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA.email);
    const res = await marcia.put('/api/me/details', { ...MARCIA, email: 'Andre.C@example.com' });
    assert.deepEqual(res.body.errors, { email: ['Use a different email address'] });
  });
});

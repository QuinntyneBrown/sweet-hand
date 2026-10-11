import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, signedInClient, startApi, type Api } from '../support/api.ts';
import { SEED_PASSWORD } from '../../src/seed/users.ts';
import { enquiries, type Enquiry } from '../../src/enquiries/model.ts';

/** The test owns every enquiry it checks: the seeded ones are set aside. */
async function clearEnquiries(api: Api): Promise<void> {
  await api.env.db.transaction(async (tx) => {
    for (const e of await enquiries(tx).all()) await enquiries(tx).delete(e.id);
  });
}

function enquiry(id: string, customerId: string, catererId: string, status: Enquiry['status'], events: Enquiry['events'] = []): Enquiry {
  return {
    id,
    customerId,
    catererId,
    eventDate: '2026-12-05',
    guests: 40,
    area: 'scarborough',
    fsa: null,
    occasion: 'birthdays',
    message: 'Could you cater a birthday lunch for 40 people?',
    createdAt: '2026-10-01T14:00:00.000Z',
    status,
    events,
    readAt: {},
  };
}

describe('delete account (L2-072)', () => {
  it('Given a signed-in customer, when they confirm with their password, then they are signed out everywhere, emailed, and cannot sign in again (L2-072.1)', async () => {
    const api = await startApi();
    const other = await signedInClient(api, 'marcia.t@example.com');
    const marcia = await signedInClient(api, 'marcia.t@example.com');

    const res = await marcia.post('/api/me/deletion', { password: SEED_PASSWORD });

    assert.equal(res.status, 204);
    assert.equal(marcia.cookies.has('sh_session'), false);
    assert.equal((await other.get('/api/session')).body.user, null);
    assert.equal((await documents(api, 'sessions')).some((s) => s.userId === 'user-marcia'), false);
    assert.deepEqual((await outbox(api)).map((m) => [m.to, m.kind]), [['marcia.t@example.com', 'account-deleted']]);
    const signIn = await api.client().post('/api/identity/sign-in', { email: 'marcia.t@example.com', password: SEED_PASSWORD });
    assert.equal(signIn.status, 401);
    assert.equal(signIn.body.title, 'Email or password is incorrect');
  });

  it('Given a deleted customer, when the record is inspected, then their name, email and phone are gone and their reviews are removed from the caterer’s average (L2-072.2, L2-072.3)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');
    const before = (await api.client().get('/api/public/caterers/pelau-house')).body;

    await marcia.post('/api/me/deletion', { password: SEED_PASSWORD });

    const record = JSON.stringify((await documents(api, 'users')).find((u) => u.id === 'user-marcia'));
    assert.equal(record.includes('marcia.t@example.com'), false);
    assert.equal(record.includes('647 555 0187'), false);
    assert.equal(record.includes('Marcia'), false);
    assert.equal((await documents(api, 'reviews')).some((r) => r.authorUserId === 'user-marcia'), false);
    const after = (await api.client().get('/api/public/caterers/pelau-house')).body;
    assert.equal(after.rating.count, before.rating.count - 1);
  });

  it('Given a deleted customer’s threads, when the deletion is processed, then the messages stay for the caterer and contact details they shared are no longer there', async () => {
    const api = await startApi();
    await clearEnquiries(api);
    await api.env.db.transaction((tx) =>
      enquiries(tx).put(
        enquiry('enq-m', 'user-marcia', 'cat-001', 'Replied', [
          { id: 'ev-1', kind: 'reply', by: 'caterer', at: '2026-10-02T14:00:00.000Z', text: 'Yes, we can.' },
          { id: 'ev-2', kind: 'shared', by: 'customer', at: '2026-10-02T15:00:00.000Z', text: '+1 647 555 0187' },
        ]),
      ),
    );
    const marcia = await signedInClient(api, 'marcia.t@example.com');

    await marcia.post('/api/me/deletion', { password: SEED_PASSWORD });

    const [thread] = await documents(api, 'enquiries');
    assert.equal(thread.message, 'Could you cater a birthday lunch for 40 people?');
    assert.equal(thread.events[0].text, 'Yes, we can.');
    assert.equal(JSON.stringify(thread).includes('647 555 0187'), false);
  });

  it('Given a wrong password, when deletion is confirmed, then it is refused and nothing is deleted', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');

    const res = await marcia.post('/api/me/deletion', { password: 'pelau1234' });

    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { password: ['That password isn’t right'] });
    assert.equal((await documents(api, 'users')).find((u) => u.id === 'user-marcia').deleted, undefined);
    assert.equal((await marcia.get('/api/session')).body.user.email, 'marcia.t@example.com');
    assert.deepEqual(await outbox(api), []);
  });

  it('Given 5 wrong confirmations within 15 minutes, when the owner next signs in, then sign-in is paused as for failed sign-ins (L2-076.4)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');
    for (let i = 0; i < 5; i++) await marcia.post('/api/me/deletion', { password: `wrong-password-${i}` });
    assert.equal((await api.client().post('/api/identity/sign-in', { email: 'marcia.t@example.com', password: SEED_PASSWORD })).status, 423);
  });

  it('Given a caterer, when they delete their account, then the profile leaves public view, its own files are deleted and each open enquiry is closed with an email to the customer (L2-072.4)', async () => {
    const api = await startApi();
    await clearEnquiries(api);
    await api.env.db.transaction(async (tx) => {
      await enquiries(tx).put(enquiry('enq-1', 'user-priya', 'cat-001', 'Open'));
      await enquiries(tx).put(enquiry('enq-2', 'user-andre', 'cat-001', 'Replied'));
      await enquiries(tx).put(enquiry('enq-3', 'user-nadia', 'cat-001', 'Closed'));
    });
    // Kendra uploaded one photo of her own; her seeded photos are also other caterers' main photos.
    const photo = 'pelau-upload-1.jpg';
    await api.env.media.put(photo, { contentType: 'image/jpeg', bytes: Buffer.from('jpeg') });
    await api.env.db.transaction(async (tx) => {
      const profile = (await tx.collection<any>('caterers').get('cat-001'))!;
      await tx.collection<any>('caterers').put({ ...profile, photos: [...profile.photos, { id: 'pelau-upload-1', file: photo, caption: 'Pelau' }] });
    });
    const shared = 'pelau-house.jpg';
    const kendra = await signedInClient(api, 'kendra@pelauhouse.example');
    assert.equal((await api.client().get(`/media/${photo}`)).status, 200);

    const res = await kendra.post('/api/me/deletion', { password: SEED_PASSWORD });

    assert.equal(res.status, 204);
    const profile = (await documents(api, 'caterers')).find((c) => c.id === 'cat-001');
    assert.notEqual(profile.status, 'Published');
    assert.deepEqual([profile.photos, profile.dishes, profile.certificate], [[], [], undefined]);
    assert.equal((await api.client().get('/api/public/caterers/pelau-house')).status >= 400, true);
    assert.equal((await api.client().get(`/media/${photo}`)).status, 404);
    assert.equal((await api.client().get(`/media/${shared}`)).status, 200, 'a file another profile shows stays');
    const statuses = Object.fromEntries((await documents(api, 'enquiries')).map((e) => [e.id, e.status]));
    assert.deepEqual(statuses, { 'enq-1': 'Closed', 'enq-2': 'Closed', 'enq-3': 'Closed' });
    const mail = (await outbox(api)).map((m) => [m.to, m.kind]);
    assert.deepEqual(mail.sort(), [
      ['andre.c@example.com', 'enquiry-closed'],
      ['kendra@pelauhouse.example', 'account-deleted'],
      ['priya.r@example.com', 'enquiry-closed'],
    ]);
    assert.equal((await documents(api, 'reviews')).some((r) => r.catererId === 'cat-001'), false);
  });

  it('Given an operator, when they try to delete their account here, then it is refused: an Admin manages operator accounts', async () => {
    const api = await startApi();
    const tomas = await signedInClient(api, 'tomas@sweethand.example');
    assert.equal((await tomas.post('/api/me/deletion', { password: SEED_PASSWORD })).status, 403);
  });
});

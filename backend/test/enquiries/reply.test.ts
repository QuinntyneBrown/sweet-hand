import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, outbox, signedInClient, startApi, type Api, type Client } from '../support/api.ts';
import { setMailServiceStatus } from '../../src/platform/mail-service.ts';

const MARCIA = 'marcia.t@example.com';
const KENDRA = 'kendra@pelauhouse.example';
const MINUTE = 60_000;

async function idOf(client: Client, name: string): Promise<string> {
  const rows = (await client.get('/api/enquiries')).body.items;
  return rows.find((r: any) => (r.otherParty.name ?? 'former') === name).id;
}

const replyEmails = async (api: Api) => (await outbox(api)).filter((m) => m.kind === 'enquiry-messages');

describe('replying in a thread (L2-032.2, L2-033, L2-028)', () => {
  it('Given an open thread, when a party replies, then the reply is the newest entry and the thread moves to the top of their inbox (L2-032.2, L2-031.3)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    const id = await idOf(marcia, 'Sugar Dumplin');
    const res = await marcia.post(`/api/enquiries/${id}/messages`, { text: 'Could you also do a few coconut tarts without nuts?' });
    assert.equal(res.status, 201);
    assert.deepEqual(res.body.entry, { kind: 'reply', id: res.body.entry.id, from: 'customer', text: 'Could you also do a few coconut tarts without nuts?', at: '2026-10-10T14:00:00.000Z' });
    assert.equal(res.body.status, 'Open', 'a customer reply does not change the status');
    assert.equal(res.body.emailDelayed, false);
    const inbox = (await marcia.get('/api/enquiries')).body.items;
    assert.equal(inbox[0].id, id);
    assert.equal(inbox[0].unread, false);
  });

  it('Given an Open enquiry, when the caterer sends their first reply, then the status becomes Replied (L2-033.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const id = await idOf(kendra, 'Priya Ramdial');
    const res = await kendra.post(`/api/enquiries/${id}/messages`, { text: 'Yes, we can do that. Doubles are $3 each.' });
    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'Replied');
    assert.equal((await kendra.get(`/api/enquiries/${id}`)).body.status, 'Replied');
  });

  it('Given an empty or overlong reply, when it is sent, then it is refused with an inline error and nothing is saved (L2-032.2)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    const id = await idOf(marcia, 'Pelau House');
    const empty = await marcia.post(`/api/enquiries/${id}/messages`, { text: '   ' });
    assert.equal(empty.status, 400);
    assert.deepEqual(empty.body.errors, { reply: ['Write a reply before sending'] });
    const long = await marcia.post(`/api/enquiries/${id}/messages`, { text: 'a'.repeat(2001) });
    assert.deepEqual(long.body.errors, { reply: ['Keep your reply under 2,000 characters'] });
    assert.equal((await marcia.post(`/api/enquiries/${id}/messages`, { text: '😀'.repeat(2000) })).status, 201, '2,000 characters, not UTF-16 units');
    assert.equal((await marcia.get(`/api/enquiries/${id}`)).body.entries.length, 2);
  });

  it('Given a Closed or Declined enquiry, when anyone replies, then it is refused with 409 (L2-033.5)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    for (const name of ['Ti Kay', 'Demerara Kitchen']) {
      const res = await marcia.post(`/api/enquiries/${await idOf(marcia, name)}/messages`, { text: 'Hello again' });
      assert.equal(res.status, 409);
      assert.equal(res.body.title, 'This enquiry is closed');
    }
  });

  it('Given a customer who deleted their account, when the caterer replies, then it is refused (L2-072.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const res = await kendra.post(`/api/enquiries/${await idOf(kendra, 'former')}/messages`, { text: 'Are you still there?' });
    assert.equal(res.status, 409);
    assert.equal(res.body.title, 'This person has left Sweet Hand');
  });

  it('Given someone who is not a party, when they reply, then they get the same 404 (L2-034.1)', async () => {
    const api = await startApi();
    const id = await idOf(await signedInClient(api, MARCIA), 'Pelau House');
    const devon = await signedInClient(api, 'devon.w@example.com');
    assert.equal((await devon.post(`/api/enquiries/${id}/messages`, { text: 'Let me in' })).status, 404);
  });

  it('Given a caterer reply, when it is saved, then the customer is emailed with the caterer’s name, the first 200 characters and a link (L2-028.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const id = await idOf(kendra, 'Marcia Thompson');
    const text = `Thanks Marcia! ${'x'.repeat(300)}`;
    await kendra.post(`/api/enquiries/${id}/messages`, { text });
    const [email] = await replyEmails(api);
    assert.equal(email.to, MARCIA);
    assert.equal(email.from, 'Pelau House');
    assert.equal(email.excerpt, text.slice(0, 200));
    assert.equal(email.messageCount, 1);
    assert.equal(email.link, `/inbox/${id}`);
    assert.equal(email.transactional, true);
    assert.equal(email.replyTo, 'no-reply@sweethand.ca');
  });

  it('Given 3 caterer replies within 10 minutes, when notifications are processed, then the customer gets 1 email that mentions 3 new messages (L2-028.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const id = await idOf(kendra, 'Marcia Thompson');
    for (const text of ['One', 'Two', 'Three']) {
      await kendra.post(`/api/enquiries/${id}/messages`, { text });
      advanceClock(api, 3 * MINUTE);
    }
    const emails = await replyEmails(api);
    assert.equal(emails.length, 1);
    assert.equal(emails[0].messageCount, 3);
    assert.equal(emails[0].excerpt, 'Three');

    advanceClock(api, 10 * MINUTE);
    await kendra.post(`/api/enquiries/${id}/messages`, { text: 'Four' });
    assert.equal((await replyEmails(api)).length, 2, 'a reply after the 10-minute window starts a new email');
  });

  it('Given a customer reply, when it is saved, then the caterer is emailed at their account address without the customer’s email or phone (L2-028.3, L2-027.3)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    const id = await idOf(marcia, 'Pelau House');
    await marcia.post(`/api/enquiries/${id}/messages`, { text: 'Yes please hold the date!' });
    const [email] = await replyEmails(api);
    assert.equal(email.to, KENDRA);
    assert.equal(email.from, 'Marcia Thompson');
    assert.equal(email.link, `/dashboard/enquiries/${id}`);
    const raw = JSON.stringify(email);
    assert.equal(raw.includes(MARCIA), false);
    assert.equal(raw.includes('647 555 0187'), false);
  });

  it('Given the mail service is running late, when a reply is sent, then it is saved, the email waits in the queue and the reply says so (L2-030.1)', async () => {
    const api = await startApi();
    await api.env.db.transaction((tx) => setMailServiceStatus(tx, 'slow'));
    const marcia = await signedInClient(api, MARCIA);
    const res = await marcia.post(`/api/enquiries/${await idOf(marcia, 'Pelau House')}/messages`, { text: 'Hello' });
    assert.equal(res.status, 201);
    assert.equal(res.body.emailDelayed, true);
    assert.equal((await replyEmails(api))[0].status, 'queued');
    assert.equal((await documents(api, 'enquiries')).some((e) => e.events.some((ev: any) => ev.text === 'Hello')), true);
  });
});

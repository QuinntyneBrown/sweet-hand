import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { outbox, signedInClient, startApi, type Client } from '../support/api.ts';

const MARCIA = 'marcia.t@example.com';
const KENDRA = 'kendra@pelauhouse.example';

async function idOf(client: Client, name: string): Promise<string> {
  const rows = (await client.get('/api/enquiries')).body.items;
  return rows.find((r: any) => (r.otherParty.name ?? 'former') === name).id;
}

describe('declining and closing an enquiry (L2-033, L2-028.4)', () => {
  it('Given an Open enquiry, when the caterer declines it with a note, then it is Declined, the note is in the thread and the customer is emailed (L2-033.2, L2-028.4)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const id = await idOf(kendra, 'Priya Ramdial');
    const res = await kendra.post(`/api/enquiries/${id}/decline`, { note: '  Fully booked that weekend  ' });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'Declined');
    const last = res.body.entries.at(-1);
    assert.deepEqual([last.kind, last.note], ['declined', 'Fully booked that weekend']);
    const email = (await outbox(api)).find((m) => m.kind === 'enquiry-declined')!;
    assert.equal(email.to, 'priya.r@example.com');
    assert.equal(email.note, 'Fully booked that weekend');
    assert.equal(email.from, 'Pelau House');
    assert.equal(email.link, `/inbox/${id}`);
  });

  it('Given a decline without a note, when it is saved, then the note is empty', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const res = await kendra.post(`/api/enquiries/${await idOf(kendra, 'Andre Clarke')}/decline`, {});
    assert.equal(res.body.entries.at(-1).note, null);
  });

  it('Given a note over 500 characters, when the caterer declines, then it is refused and the status stays', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const id = await idOf(kendra, 'Priya Ramdial');
    const res = await kendra.post(`/api/enquiries/${id}/decline`, { note: 'n'.repeat(501) });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { note: ['Keep your note under 500 characters'] });
    assert.equal((await kendra.get(`/api/enquiries/${id}`)).body.status, 'Open');
  });

  it('Given a Replied enquiry, when the caterer tries to decline it, then it is refused with 409 and the status does not change (L2-033.3)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const id = await idOf(kendra, 'Marcia Thompson');
    const res = await kendra.post(`/api/enquiries/${id}/decline`, {});
    assert.equal(res.status, 409);
    assert.deepEqual(res.body, { title: 'Only an open enquiry can be declined', status: 'Replied' });
    assert.equal((await kendra.get(`/api/enquiries/${id}`)).body.status, 'Replied');
  });

  it('Given the customer’s side of an enquiry, when the customer tries to decline it, then it is refused with 403', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    assert.equal((await marcia.post(`/api/enquiries/${await idOf(marcia, 'Sugar Dumplin')}/decline`, {})).status, 403);
  });

  it('Given an Open or Replied enquiry, when either party closes it, then it is Closed with an entry saying who closed it (L2-033)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    const res = await marcia.post(`/api/enquiries/${await idOf(marcia, 'Pelau House')}/close`, {});
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'Closed');
    assert.deepEqual([res.body.entries.at(-1).kind, res.body.entries.at(-1).by], ['closed', 'customer']);

    const kendra = await signedInClient(api, KENDRA);
    const closed = await kendra.post(`/api/enquiries/${await idOf(kendra, 'Andre Clarke')}/close`, {});
    assert.deepEqual([closed.body.status, closed.body.entries.at(-1).by], ['Closed', 'caterer']);
  });

  it('Given a Closed or Declined enquiry, when anyone tries to change its status, then it is refused with 409 (L2-033.5)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    const closed = await marcia.post(`/api/enquiries/${await idOf(marcia, 'Ti Kay')}/close`, {});
    assert.equal(closed.status, 409);
    assert.deepEqual(closed.body, { title: 'This enquiry is already closed', status: 'Closed' });
    const declined = await marcia.post(`/api/enquiries/${await idOf(marcia, 'Demerara Kitchen')}/close`, {});
    assert.equal(declined.status, 409);
  });

  it('Given someone who is not a party, when they decline or close it, then they get the same 404 (L2-034.1)', async () => {
    const api = await startApi();
    const id = await idOf(await signedInClient(api, KENDRA), 'Priya Ramdial');
    const vishnu = await signedInClient(api, 'vishnu@maracasbay.example');
    assert.equal((await vishnu.post(`/api/enquiries/${id}/decline`, {})).status, 404);
    assert.equal((await vishnu.post(`/api/enquiries/${id}/close`, {})).status, 404);
  });
});

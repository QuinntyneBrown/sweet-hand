import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signedInClient, startApi, type Api, type Client } from '../support/api.ts';
import { enquiries } from '../../src/enquiries/model.ts';

const MARCIA = 'marcia.t@example.com';
const KENDRA = 'kendra@pelauhouse.example';

async function idOf(client: Client, name: string): Promise<string> {
  const rows = (await client.get('/api/enquiries')).body.items;
  return rows.find((r: any) => (r.otherParty.name ?? 'former') === name).id;
}

/** A second, unrelated enquiry between Marcia and Pelau House. */
async function secondThread(api: Api, firstId: string): Promise<string> {
  const id = '0b7f4a52-3a39-4d2a-9d0b-2b8c1f3e9a10';
  await api.env.db.transaction(async (tx) => {
    const first = (await enquiries(tx).get(firstId))!;
    await enquiries(tx).put({ ...first, id, eventDate: '2026-12-19', status: 'Open', events: [], readAt: {} });
  });
  return id;
}

describe('sharing contact details (L2-035)', () => {
  it('Given a new enquiry, when the caterer views it, then the customer’s email and phone are nowhere in it (L2-035.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const res = await kendra.get(`/api/enquiries/${await idOf(kendra, 'Marcia Thompson')}`);
    const raw = JSON.stringify(res.body);
    assert.equal(raw.includes(MARCIA), false);
    assert.equal(raw.includes('647 555 0187'), false);
  });

  it('Given the customer shares their details, when the caterer views the thread, then the email and phone appear with a shared entry (L2-035.2)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    const id = await idOf(marcia, 'Pelau House');
    const res = await marcia.post(`/api/enquiries/${id}/contact-shares`, {});
    assert.equal(res.status, 200);
    assert.equal(res.body.sharedByMe, true);

    const kendra = await signedInClient(api, KENDRA);
    const t = (await kendra.get(`/api/enquiries/${id}`)).body;
    const shared = t.entries.at(-1);
    assert.equal(shared.kind, 'shared');
    assert.equal(shared.by, 'customer');
    assert.deepEqual(shared.contact, { name: 'Marcia Thompson', email: MARCIA, phone: '+1 647 555 0187' });
    assert.equal(t.sharedByMe, false);
  });

  it('Given details shared twice, when the thread is read, then there is one shared entry', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    const id = await idOf(marcia, 'Pelau House');
    await marcia.post(`/api/enquiries/${id}/contact-shares`, {});
    const again = await marcia.post(`/api/enquiries/${id}/contact-shares`, {});
    assert.equal(again.body.entries.filter((e: any) => e.kind === 'shared').length, 1);
  });

  it('Given details shared in thread T1, when the same caterer views T2 with the same customer, then they are not shown (L2-035.3)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    const first = await idOf(marcia, 'Pelau House');
    const second = await secondThread(api, first);
    await marcia.post(`/api/enquiries/${first}/contact-shares`, {});
    const kendra = await signedInClient(api, KENDRA);
    const raw = JSON.stringify((await kendra.get(`/api/enquiries/${second}`)).body);
    assert.equal(raw.includes(MARCIA), false);
  });

  it('Given the caterer shares, when the customer views the thread, then the business email and phone appear (L2-035.4)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const id = await idOf(kendra, 'Marcia Thompson');
    await kendra.post(`/api/enquiries/${id}/contact-shares`, {});
    const marcia = await signedInClient(api, MARCIA);
    const shared = (await marcia.get(`/api/enquiries/${id}`)).body.entries.at(-1);
    assert.deepEqual(shared.contact, { name: 'Pelau House', email: 'hello@pelauhouse.example', phone: '+1 416 555 0142' });
  });

  it('Given a Closed enquiry, when a party shares, then it is refused with 409; a stranger gets 404', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    const res = await marcia.post(`/api/enquiries/${await idOf(marcia, 'Ti Kay')}/contact-shares`, {});
    assert.equal(res.status, 409);
    assert.deepEqual(res.body, { title: 'This enquiry is closed', status: 'Closed' });
    const devon = await signedInClient(api, 'devon.w@example.com');
    assert.equal((await devon.post(`/api/enquiries/${await idOf(marcia, 'Pelau House')}/contact-shares`, {})).status, 404);
  });
});

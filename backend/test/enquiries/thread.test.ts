import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signedInClient, startApi, type Client } from '../support/api.ts';

const MARCIA = 'marcia.t@example.com';
const KENDRA = 'kendra@pelauhouse.example';

async function idOf(client: Client, name: string): Promise<string> {
  const rows = (await client.get('/api/enquiries')).body.items;
  return rows.find((r: any) => (r.otherParty.name ?? 'former') === name).id;
}

describe('enquiry thread (L2-032, L2-034, L2-024.3)', () => {
  it('Given Marcia’s enquiry to Pelau House, when she opens it, then the details come first and then each entry in time order', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    const id = await idOf(marcia, 'Pelau House');
    const res = await marcia.get(`/api/enquiries/${id}`);
    assert.equal(res.status, 200);
    const t = res.body;
    assert.equal(t.viewer, 'customer');
    assert.equal(t.status, 'Replied');
    assert.deepEqual(t.caterer, { name: 'Pelau House', slug: 'pelau-house', photo: '/media/pelau-house.jpg?w=400&fm=jpeg' });
    assert.deepEqual(t.customer, { name: 'Marcia Thompson', firstName: 'Marcia', initials: 'MT' });
    assert.deepEqual([t.eventDate, t.guests, t.area, t.fsa, t.occasion], ['2026-11-21', 120, 'Scarborough', 'M1E', 'Family gatherings']);
    assert.equal(t.sentAt, '2026-10-08T23:15:00.000Z');
    assert.match(t.message, /^Hi Kendra/);
    assert.equal(t.entries.length, 1);
    assert.equal(t.entries[0].kind, 'reply');
    assert.equal(t.entries[0].from, 'caterer');
    assert.deepEqual(t.fitWarnings, [], 'fit warnings are for the caterer only');
    assert.deepEqual(t.myContact, { name: 'Marcia Thompson', email: MARCIA, phone: '+1 647 555 0187' });
    assert.equal(t.sharedByMe, false);
    assert.equal(t.closesOn, null);
  });

  it('Given an unread thread, when its party opens it, then it is read; the caterer’s preview pane can look without marking it read (L2-029.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const priya = await idOf(kendra, 'Priya Ramdial');
    await kendra.get(`/api/enquiries/${priya}?markRead=false`);
    assert.equal((await kendra.get('/api/session')).body.unread, 2);
    await kendra.get(`/api/enquiries/${priya}`);
    assert.equal((await kendra.get('/api/session')).body.unread, 1);
  });

  it('Given an enquiry outside what the caterer takes on, when the caterer opens it, then they see the fit warning (L2-024.3)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const t = (await kendra.get(`/api/enquiries/${await idOf(kendra, 'Priya Ramdial')}`)).body;
    assert.equal(t.viewer, 'caterer');
    assert.deepEqual(t.fitWarnings, [{ kind: 'area', area: 'Downtown Toronto' }]);
    assert.deepEqual(t.myContact, { name: 'Pelau House', email: 'hello@pelauhouse.example', phone: '+1 416 555 0142' });
  });

  it('Given a customer who deleted their account, when the caterer opens the thread, then the customer shows as nobody (L2-072.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const t = (await kendra.get(`/api/enquiries/${await idOf(kendra, 'former')}`)).body;
    assert.equal(t.customer, null);
    assert.equal(t.entries.length, 2);
  });

  it('Given customer A’s enquiry to caterer X, when customer B, caterer Y or a made-up id asks for it, then each gets the same 404 (L2-034.1)', async () => {
    const api = await startApi();
    const id = await idOf(await signedInClient(api, MARCIA), 'Pelau House');
    const devon = await signedInClient(api, 'devon.w@example.com');
    const vishnu = await signedInClient(api, 'vishnu@maracasbay.example');
    const asB = await devon.get(`/api/enquiries/${id}`);
    const asY = await vishnu.get(`/api/enquiries/${id}`);
    const missing = await devon.get('/api/enquiries/6f1c1b0e-2d1a-4c8e-9a43-0b5b1f2a7c11');
    for (const res of [asB, asY, missing]) {
      assert.equal(res.status, 404);
      assert.deepEqual(res.body, { title: 'Not found' });
    }
    assert.equal((await api.client().get(`/api/enquiries/${id}`)).status, 401);
  });

  it('Given an Open or Replied enquiry whose event has passed, when it is opened, then it says when it will close (L2-033.4)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const t = (await kendra.get(`/api/enquiries/${await idOf(kendra, 'former')}`)).body;
    assert.equal(t.closesOn, '2026-10-26');
  });
});

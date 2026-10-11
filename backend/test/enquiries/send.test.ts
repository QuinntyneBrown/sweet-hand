import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, outbox, signedInClient, startApi, type Api } from '../support/api.ts';
import { users } from '../../src/identity/model.ts';
import { setMailServiceStatus } from '../../src/platform/mail-service.ts';

const DEVON = 'devon.w@example.com';
const HOUR = 60 * 60_000;
const MESSAGE = 'We’d love pelau, curry goat and macaroni pie for about 120 people, buffet style around 6 p.m.';
const BODY = {
  catererSlug: 'pelau-house',
  eventDate: '2026-11-21',
  guests: '120',
  area: 'scarborough',
  postalCode: 'm1e 4r8',
  occasion: 'family-gatherings',
  message: MESSAGE,
  challengeToken: 'local:enquiry:test',
};

async function changeUser(api: Api, id: string, change: Record<string, unknown>): Promise<void> {
  await api.env.db.transaction(async (tx) => {
    const u = (await users(tx).get(id))!;
    await users(tx).put({ ...u, ...change });
  });
}

const enquiryCount = async (api: Api) => (await documents(api, 'enquiries')).length;

describe('sending an enquiry (L2-022, L2-023, L2-024, L2-027, L2-030)', () => {
  it('Given a verified customer and valid values, when they send, then an Open enquiry is created and confirmed, in both inboxes (L2-022.1)', async () => {
    const api = await startApi();
    const devon = await signedInClient(api, DEVON);
    const res = await devon.post('/api/enquiries', BODY);
    assert.equal(res.status, 201);
    assert.match(res.body.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.deepEqual(res.body, {
      id: res.body.id,
      caterer: { name: 'Pelau House', slug: 'pelau-house' },
      contactName: 'Kendra',
      eventDate: '2026-11-21',
      guests: 120,
      area: 'Scarborough',
      occasion: 'Family gatherings',
      emailQueued: false,
    });
    const stored = (await documents(api, 'enquiries')).find((e) => e.id === res.body.id);
    assert.equal(stored.status, 'Open');
    assert.equal(stored.fsa, 'M1E', 'only the forward sortation area is kept');
    assert.equal(JSON.stringify(stored).includes('4R8'), false);

    assert.equal((await devon.get('/api/enquiries')).body.items[0].id, res.body.id);
    const kendra = await signedInClient(api, 'kendra@pelauhouse.example');
    const row = (await kendra.get('/api/enquiries')).body.items[0];
    assert.deepEqual([row.id, row.otherParty.name, row.unread], [res.body.id, 'Devon Walters', true]);
  });

  it('Given an enquiry is created, when it is saved, then the caterer is emailed the details and a link, without the customer’s email or phone (L2-027)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');
    const res = await marcia.post('/api/enquiries', { ...BODY, eventDate: '2026-12-19', message: `${'m'.repeat(250)} reach me at marcia` });
    const email = (await outbox(api)).find((m) => m.kind === 'new-enquiry')!;
    assert.equal(email.to, 'kendra@pelauhouse.example');
    assert.deepEqual(
      [email.customerName, email.eventDate, email.guests, email.area, email.occasion, email.link],
      ['Marcia Thompson', '2026-12-19', 120, 'Scarborough', 'Family gatherings', `/dashboard/enquiries/${res.body.id}`],
    );
    assert.equal(email.excerpt, 'm'.repeat(200));
    assert.equal(email.replyTo, 'no-reply@sweethand.ca');
    assert.equal(email.transactional, true);
    assert.equal(JSON.stringify(email).includes('marcia.t@example.com'), false);
    assert.equal(JSON.stringify(email).includes('647 555 0187'), false);
  });

  it('Given the email provider is down, when a customer sends, then the enquiry is still created, the email queued and the reply says so (L2-030.1)', async () => {
    const api = await startApi();
    await api.env.db.transaction((tx) => setMailServiceStatus(tx, 'down'));
    const devon = await signedInClient(api, DEVON);
    const res = await devon.post('/api/enquiries', BODY);
    assert.equal(res.status, 201);
    assert.equal(res.body.emailQueued, true);
    assert.equal((await outbox(api)).find((m) => m.kind === 'new-enquiry')!.status, 'queued');
  });

  it('Given a request that skips the form’s checks, when it is sent, then each failing field has an error and nothing is created (L2-022.6)', async () => {
    const api = await startApi();
    const devon = await signedInClient(api, DEVON);
    const before = await enquiryCount(api);
    const res = await devon.post('/api/enquiries', {
      ...BODY,
      eventDate: '2026-10-11',
      guests: 'fifty',
      area: 'atlantis',
      postalCode: '12345',
      occasion: 'launch-party',
      message: 'Too short',
    });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, {
      eventDate: ['Choose a date at least 2 days from today'],
      guests: ['Enter a whole number of guests from 1 to 5,000'],
      area: ['Choose an area'],
      postalCode: ['Enter a valid postal code, like M1E 4R8'],
      occasion: ['Choose an occasion'],
      message: ['Tell the caterer a little more (at least 20 characters)'],
    });
    assert.equal(await enquiryCount(api), before);
  });

  it('Given each field’s limits, when values sit just outside them, then the matching message is given (L2-022.2–5)', async () => {
    const api = await startApi();
    const devon = await signedInClient(api, DEVON);
    const errors = async (change: Record<string, unknown>) => (await devon.post('/api/enquiries', { ...BODY, ...change })).body.errors ?? {};
    assert.deepEqual((await errors({ eventDate: '2028-10-11' })).eventDate, ['Choose a date within the next 24 months']);
    assert.deepEqual((await errors({ eventDate: '' })).eventDate, ['Choose a date for your event']);
    for (const guests of ['0', '5001', '12.5', 'fifty']) assert.deepEqual((await errors({ guests })).guests, ['Enter a whole number of guests from 1 to 5,000']);
    assert.deepEqual((await errors({ message: 'x'.repeat(19) })).message, ['Tell the caterer a little more (at least 20 characters)']);
    assert.deepEqual((await errors({ message: 'x'.repeat(2001) })).message, ['Keep your message under 2,000 characters']);
    assert.equal((await devon.post('/api/enquiries', { ...BODY, eventDate: '2026-10-12', guests: 5000, postalCode: '' })).status, 201);
  });

  it('Given values outside what the caterer takes on, when the enquiry is sent, then it is accepted and the caterer sees the same warnings (L2-024.3)', async () => {
    const api = await startApi();
    const devon = await signedInClient(api, DEVON);
    const res = await devon.post('/api/enquiries', { ...BODY, guests: '500', area: 'oshawa' });
    assert.equal(res.status, 201);
    const kendra = await signedInClient(api, 'kendra@pelauhouse.example');
    const t = (await kendra.get(`/api/enquiries/${res.body.id}`)).body;
    assert.deepEqual(t.fitWarnings, [
      { kind: 'guests', min: 20, max: 300 },
      { kind: 'area', area: 'Oshawa' },
    ]);
  });

  it('Given a caterer or an operator, when they send an enquiry, then it is refused as customer-only (L2-023.4)', async () => {
    const api = await startApi();
    for (const email of ['kendra@pelauhouse.example', 'tomas@sweethand.example']) {
      const res = await (await signedInClient(api, email)).post('/api/enquiries', { ...BODY, catererSlug: 'cou-cou' });
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'customer-only');
    }
    assert.equal((await api.client().post('/api/enquiries', BODY)).status, 401);
  });

  it('Given a customer who has not verified their email, when they send, then nothing is sent and they are told to verify (L2-023.2)', async () => {
    const api = await startApi();
    await changeUser(api, 'user-devon', { emailVerified: false });
    const devon = await signedInClient(api, DEVON);
    const res = await devon.post('/api/enquiries', BODY);
    assert.equal(res.status, 403);
    assert.deepEqual(res.body, { title: 'Verify your email to send enquiries', code: 'email-unverified' });
  });

  it('Given an unknown or unpublished caterer, when an enquiry is sent to it, then it is not found', async () => {
    const api = await startApi();
    const devon = await signedInClient(api, DEVON);
    assert.equal((await devon.post('/api/enquiries', { ...BODY, catererSlug: 'atlantis-kitchen' })).status, 404);
    assert.equal((await devon.post('/api/enquiries', { ...BODY, catererSlug: 'tamarind-tree' })).status, 404);
  });
});

describe('enquiry abuse limits (L2-025)', () => {
  it('Given a missing or forged bot-protection token, when an enquiry is sent, then it is refused with 400 and nothing is created (L2-025.4)', async () => {
    const api = await startApi();
    const devon = await signedInClient(api, DEVON);
    const before = await enquiryCount(api);
    for (const challengeToken of [undefined, 'i-am-a-person', 'local:sign-in:1']) {
      const res = await devon.post('/api/enquiries', { ...BODY, challengeToken });
      assert.equal(res.status, 400);
      assert.equal(res.body.code, 'challenge-failed');
    }
    assert.equal(await enquiryCount(api), before);
  });

  it('Given 10 enquiries in the past 24 hours, when an 11th is sent, then it is refused with 429 until the oldest is a day old (L2-025.1)', async () => {
    const api = await startApi();
    const devon = await signedInClient(api, DEVON);
    const slugs = ['cou-cou', 'scotch-bonnet-social', 'ti-kay', 'black-cake-co', 'demerara-kitchen', 'pimento-and-thyme', 'sugar-dumplin', 'maracas-bay', 'cook-up', 'sorrel-and-spice'];
    for (const slug of slugs) {
      assert.equal((await devon.post('/api/enquiries', { ...BODY, catererSlug: slug })).status, 201, slug);
      advanceClock(api, HOUR);
    }
    const refused = await devon.post('/api/enquiries', BODY);
    assert.equal(refused.status, 429);
    assert.deepEqual(refused.body, { title: 'You’ve reached today’s enquiry limit. Try again tomorrow.', code: 'daily-limit' });
    assert.equal(refused.headers.get('retry-after'), String(14 * 3600));
    const blocks = (await documents(api, 'securityEvents')).filter((e) => e.type === 'rate-limit-block');
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].userId, 'user-devon');

    advanceClock(api, 14 * HOUR);
    assert.equal((await devon.post('/api/enquiries', BODY)).status, 201);
  });

  it('Given an Open or Replied enquiry to a caterer for a date, when another is sent for that date, then it is refused with a link to the existing one; another date is fine (L2-025.2)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');
    const existing = (await marcia.get('/api/enquiries')).body.items.find((r: any) => r.otherParty.name === 'Pelau House').id;
    const res = await marcia.post('/api/enquiries', BODY);
    assert.equal(res.status, 409);
    assert.deepEqual(res.body, { title: 'You already have an open enquiry with this caterer for that date', code: 'duplicate', enquiryId: existing });
    assert.equal((await marcia.post('/api/enquiries', { ...BODY, eventDate: '2026-12-19' })).status, 201);
    assert.equal((await marcia.post('/api/enquiries', { ...BODY, catererSlug: 'demerara-kitchen' })).status, 201, 'a declined enquiry for the date does not block a new one');
  });

  it('Given an account less than an hour old, when it sends enquiries, then 3 are accepted and the 4th is refused (L2-025.3)', async () => {
    const api = await startApi();
    await changeUser(api, 'user-devon', { createdAt: new Date(api.env.clock.now().getTime() - 20 * 60_000).toISOString() });
    const devon = await signedInClient(api, DEVON);
    for (const slug of ['cou-cou', 'ti-kay', 'sunday-pot']) assert.equal((await devon.post('/api/enquiries', { ...BODY, catererSlug: slug })).status, 201);
    const refused = await devon.post('/api/enquiries', BODY);
    assert.equal(refused.status, 429);
    assert.deepEqual(refused.body, { title: 'New accounts can send 3 enquiries in their first hour', code: 'new-account-limit' });
    assert.equal(refused.headers.get('retry-after'), String(40 * 60));
    advanceClock(api, 40 * 60_000);
    assert.equal((await devon.post('/api/enquiries', BODY)).status, 201);
  });
});

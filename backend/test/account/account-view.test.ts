import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signedInClient, startApi, type Api } from '../support/api.ts';
import { enquiries, type Enquiry } from '../../src/enquiries/model.ts';
import { reports, type Report } from '../../src/reports/model.ts';

function enquiry(id: string, customerId: string, catererId: string, status: Enquiry['status'], createdAt = '2026-10-01T14:00:00.000Z'): Enquiry {
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
    createdAt,
    status,
    events: [],
    readAt: {},
  };
}

async function arrange(api: Api, docs: { enquiries?: Enquiry[]; reports?: Report[] }): Promise<void> {
  await api.env.db.transaction(async (tx) => {
    // The test owns every enquiry and report it counts: the seeded ones are set aside.
    for (const e of await enquiries(tx).all()) await enquiries(tx).delete(e.id);
    for (const r of await reports(tx).all()) await reports(tx).delete(r.id);
    for (const e of docs.enquiries ?? []) await enquiries(tx).put(e);
    for (const r of docs.reports ?? []) await reports(tx).put(r);
  });
}

describe('account view (account page, L2-070.3, L2-071, L2-072)', () => {
  it('Given a signed-in customer, when they open their account, then they see their details, consent and what an export or deletion covers', async () => {
    const api = await startApi();
    await arrange(api, {
      enquiries: [enquiry('enq-a', 'user-marcia', 'cat-001', 'Replied'), enquiry('enq-b', 'user-marcia', 'cat-002', 'Closed'), enquiry('enq-c', 'user-andre', 'cat-001', 'Open')],
      reports: [{ id: 'rep-1', targetKind: 'Review', targetId: 'review-devon-maracas', reason: 'Inappropriate content', reporterUserId: 'user-marcia', createdAt: '2026-10-01T14:00:00.000Z', status: 'Open' }],
    });
    const marcia = await signedInClient(api, 'marcia.t@example.com');

    const res = await marcia.get('/api/me/account');

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      role: 'Customer',
      displayName: 'Marcia Thompson',
      email: 'marcia.t@example.com',
      emailVerified: true,
      verificationSentAt: null,
      emailBounced: false,
      phone: '+1 647 555 0187',
      memberSince: '2026-03-14T15:20:00Z',
      passwordChangedAt: '2026-03-14T15:20:00Z',
      privacy: { version: '2026-03', acceptedAt: '2026-03-14T15:20:00Z' },
      business: null,
      dataExport: null,
      exportContents: { enquiries: 2, reviews: 1, reports: 1, photos: 0, dishes: 0, reviewResponses: 0 },
      deletion: { reviews: 1, openEnquiries: 0, customersToTell: [] },
    });
  });

  it('Given a signed-in caterer, when they open their account, then the counts come from their profile, reviews and open enquiries, newest enquiry first', async () => {
    const api = await startApi();
    await arrange(api, {
      enquiries: [
        enquiry('enq-1', 'user-marcia', 'cat-001', 'Replied', '2026-10-01T14:00:00.000Z'),
        enquiry('enq-2', 'user-andre', 'cat-001', 'Open', '2026-10-03T14:00:00.000Z'),
        enquiry('enq-3', 'user-priya', 'cat-001', 'Open', '2026-10-05T14:00:00.000Z'),
        enquiry('enq-4', 'user-nadia', 'cat-001', 'Closed'),
        enquiry('enq-5', 'user-devon', 'cat-002', 'Open'),
      ],
    });
    const kendra = await signedInClient(api, 'kendra@pelauhouse.example');

    const res = await kendra.get('/api/me/account');

    assert.equal(res.body.role, 'Caterer');
    assert.deepEqual(res.body.business, { name: 'Pelau House' });
    assert.deepEqual(res.body.exportContents, { enquiries: 4, reviews: 23, reports: 0, photos: 6, dishes: 18, reviewResponses: 22 });
    assert.deepEqual(res.body.deletion, { reviews: 23, openEnquiries: 3, customersToTell: ['Priya', 'Andre', 'Marcia'] });
  });

  it('Given a visitor, when they ask for an account, then they must sign in', async () => {
    const api = await startApi();
    assert.equal((await api.client().get('/api/me/account')).status, 401);
  });
});

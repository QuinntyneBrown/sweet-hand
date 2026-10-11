import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, signedInClient, startApi, type Api } from '../support/api.ts';
import { auditOf, putCastReports, scenario } from './support.ts';

const find = async (api: Api, collection: string, id: string) => (await documents(api, collection)).find((d) => d.id === id);

async function arranged() {
  const api = await startApi();
  await putCastReports(api);
  return { api, leah: await signedInClient(api, 'leah@sweethand.example') };
}

describe('handling reports (L2-055, L2-034.3–4)', () => {
  it('Given 2 reports about one review, when an operator opens the report, then they are grouped with every reason and detail, reporters unnamed (L2-055.1)', async () => {
    const { leah } = await arranged();
    const res = await leah.get('/api/operator/reports/R-2041');
    assert.equal(res.status, 200);
    const v = res.body;
    assert.equal(v.id, 'R-2041');
    assert.equal(v.status, 'Open');
    assert.equal(v.since, '2026-10-08T20:12:00.000Z');
    assert.deepEqual(v.target, {
      kind: 'Review',
      reviewId: 'review-devon-maracas',
      caterer: { name: 'Maracas Bay', photo: '/media/maracas-bay.jpg?w=400&fm=jpeg' },
      author: 'Devon W.',
      rating: 1,
      text: 'Food was cold and the owner is a crook. Everybody knows that family can’t cook. Avoid.',
      eventDate: '2026-09-12',
      status: 'Published',
      hiddenBy: null,
      hiddenAt: null,
    });
    assert.deepEqual(v.reports, [
      { reason: 'Fake or spam', details: 'This person never booked them. The same words were posted about two other caterers.', at: '2026-10-08T20:12:00.000Z', signedIn: true },
      { reason: 'Inappropriate content', details: 'It insults the owner’s family, not the food.', at: '2026-10-09T15:30:00.000Z', signedIn: false },
    ]);
    assert.deepEqual(v.linkedEnquiry, { customer: 'Devon W.', caterer: 'Maracas Bay', eventDate: '2026-09-12', guests: 35, status: 'Replied' });
    assert.equal(v.resolution, null);
    assert.equal(JSON.stringify(v).includes('user-priya') || JSON.stringify(v).includes('Priya'), false, 'reporters are never named');
    assert.equal((await leah.get('/api/operator/reports/R-2044')).body.id, 'R-2041', 'any report of the group opens the group');
    assert.equal((await leah.get('/api/operator/reports/R-9999')).status, 404);
  });

  it('Given a report about a caterer, when it is opened, then the caterer, its owner and certificate are shown, with no linked enquiry', async () => {
    const { leah } = await arranged();
    const v = (await leah.get('/api/operator/reports/R-2047')).body;
    assert.deepEqual(v.target, {
      kind: 'CatererProfile',
      catererId: 'cat-018',
      name: 'Island Pot',
      photo: '/media/island-pot.jpg?w=400&fm=jpeg',
      cuisine: 'Jamaican',
      area: 'Scarborough',
      owner: 'Garfield Brown',
      status: 'Published',
      certificate: { holder: 'Garfield Brown', issuer: 'Toronto Public Health', number: 'FH-2023-552019', expires: '2027-02-02', expired: false, fileName: 'food-handler-certificate.pdf', fileSize: 1258291 },
    });
    assert.equal(v.linkedEnquiry, null);
  });

  it('Given an automatically hidden review, when an operator dismisses its reports with a note, then they close, the review is back, the reporter is told without the outcome and it is audited (L2-055.3, L2-055.5)', async () => {
    const { api, leah } = await arranged();
    await scenario(api, 'third-report');
    const opened = (await leah.get('/api/operator/reports/R-2041')).body;
    assert.equal(opened.reports.length, 3);
    assert.deepEqual([opened.target.status, opened.target.hiddenBy, opened.target.hiddenAt], ['Hidden', 'reports', '2026-10-10T12:05:00.000Z']);
    assert.deepEqual((await leah.post('/api/operator/reports/R-2041/resolve', { decision: 'dismiss', note: '' })).body.errors, { note: ['Add a note explaining your decision'] });

    const note = 'The review describes a real event; Devon W.’s enquiry was replied to and the event happened.';
    const res = await leah.post('/api/operator/reports/R-2041/resolve', { decision: 'dismiss', note });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'Resolved');
    assert.equal(res.body.target.status, 'Published');
    const audit = await auditOf(api);
    assert.deepEqual(audit.map((a) => [a.operatorId, a.action, a.targetType, a.targetId, a.reason]), [['user-leah', 'Dismiss reports', 'Report', 'R-2041', note]]);
    assert.deepEqual(res.body.resolution, { at: '2026-10-10T14:00:00.000Z', by: 'Leah Mohammed', outcome: 'dismissed', note, auditId: audit[0].id, reporterEmailed: true });
    assert.equal((await documents(api, 'reports')).filter((r) => r.targetId === 'review-devon-maracas' && r.status === 'Open').length, 0);
    const reviewed = (await outbox(api)).filter((e) => e.kind === 'report-reviewed');
    assert.deepEqual(reviewed.map((e) => e.to).sort(), ['andre.c@example.com', 'priya.r@example.com']);
    assert.ok(reviewed.every((e) => e.reason === undefined && e.note === undefined), 'the email never says what was decided');
    assert.equal((await find(api, 'reviews', 'review-devon-maracas')).status, 'Published');
    assert.equal((await leah.post('/api/operator/reports/R-2041/resolve', { decision: 'dismiss', note })).status, 409);
    assert.equal((await leah.get('/api/operator/reports/R-2041')).body.resolution.outcome, 'dismissed', 'a resolved group still opens');
  });

  it('Given a reported review, when an operator takes action and hides it, then it is hidden, the reports link to the audit entry and the author is told why (L2-055.4, L2-059.2)', async () => {
    const { api, leah } = await arranged();
    const note = 'Personal attack on the owner’s family, not a review of the food.';
    const res = await leah.post('/api/operator/reports/R-2041/resolve', { decision: 'action', action: 'hide', note });
    assert.equal(res.status, 200);
    assert.deepEqual([res.body.target.status, res.body.target.hiddenBy], ['Hidden', 'operator']);
    const hide = (await auditOf(api)).find((a) => a.action === 'Hide review');
    assert.deepEqual([hide.targetType, hide.targetId, hide.reason, hide.before, hide.after], ['Review', 'review-devon-maracas', note, { status: 'Published' }, { status: 'Hidden' }]);
    assert.deepEqual((await find(api, 'reports', 'R-2041')).resolution, { at: '2026-10-10T14:00:00.000Z', byUserId: 'user-leah', outcome: 'hidden', note, auditId: hide.id });
    assert.ok((await outbox(api)).some((e) => e.to === 'devon.w@example.com' && e.kind === 'review-hidden' && e.reason === note));
    assert.equal((await find(api, 'reviews', 'review-devon-maracas')).status, 'Hidden');
  });

  it('Given a reported review, when an operator removes it, then it is removed for good', async () => {
    const { api, leah } = await arranged();
    const res = await leah.post('/api/operator/reports/R-2041/resolve', { decision: 'action', action: 'remove-review', note: 'Hate speech.' });
    assert.equal(res.body.resolution.outcome, 'review-removed');
    assert.equal((await find(api, 'reviews', 'review-devon-maracas')).status, 'Removed');
    assert.ok((await outbox(api)).some((e) => e.kind === 'review-removed' && e.to === 'devon.w@example.com'));
  });

  it('Given a report about a caterer, when an operator takes action, then the caterer is suspended (or removed) and the report is resolved (L2-055.4)', async () => {
    const { api, leah } = await arranged();
    assert.deepEqual((await leah.post('/api/operator/reports/R-2047/resolve', { decision: 'action', note: '' })).body.errors, { note: ['Add a reason for this change'] });
    const res = await leah.post('/api/operator/reports/R-2047/resolve', { decision: 'action', action: 'suspend', note: 'Food safety concern under investigation after report R-2047.' });
    assert.equal(res.status, 200);
    assert.deepEqual([res.body.target.status, res.body.resolution.outcome, res.body.resolution.reporterEmailed], ['Suspended', 'suspended', false]);
    assert.equal((await find(api, 'caterers', 'cat-018')).status, 'Suspended');
    assert.ok((await outbox(api)).some((e) => e.kind === 'caterer-suspended' && e.to === 'garfield@islandpot.example'));

    const removed = await leah.post('/api/operator/reports/R-2052/resolve', { decision: 'action', action: 'remove', note: 'Closed for good.' });
    assert.equal(removed.body.resolution.outcome, 'removed');
    assert.equal((await find(api, 'caterers', 'cat-001')).status, 'Removed');
  });

  it('Given a report linked to an enquiry, when an operator opens the enquiry with a reason, then it is shown read-only and the access is audited (L2-034.3)', async () => {
    const { api, leah } = await arranged();
    assert.deepEqual((await leah.post('/api/operator/reports/R-2041/enquiry', { reason: ' ' })).body.errors, { reason: ['Add a reason for opening this enquiry'] });
    const res = await leah.post('/api/operator/reports/R-2041/enquiry', { reason: 'Checking whether the event in the review happened.' });
    assert.equal(res.status, 200);
    assert.equal(res.body.customer, 'Devon W.');
    assert.equal(res.body.caterer, 'Maracas Bay');
    assert.match(res.body.message, /we need curry duck, buss up shut and macaroni pie for 35/);
    assert.deepEqual(res.body.entries.map((e: any) => e.from), ['caterer', 'customer']);
    const devons = (await documents(api, 'enquiries')).filter((e) => e.customerId === 'user-devon' && e.catererId === 'cat-009');
    const opened = (await auditOf(api))[0];
    assert.ok(devons.some((e) => e.id === opened.targetId), 'the audit names Devon’s enquiry to Maracas Bay');
    assert.deepEqual((await auditOf(api)).map((a) => [a.operatorId, a.action, a.targetType, a.reason, a.after]), [
      ['user-leah', 'Open enquiry', 'Enquiry', 'Checking whether the event in the review happened.', { reportId: 'R-2041' }],
    ]);
  });

  it('Given no report links to an enquiry any more, when an operator tries to open it, then the answer is 403 and nothing is recorded (L2-034.4)', async () => {
    const { api, leah } = await arranged();
    await scenario(api, 'unlink-review-enquiry');
    assert.equal((await leah.post('/api/operator/reports/R-2041/enquiry', { reason: 'Checking the event.' })).status, 403);
    assert.equal((await leah.post('/api/operator/reports/R-2047/enquiry', { reason: 'Checking.' })).status, 403, 'a caterer report links to no enquiry');
    assert.deepEqual(await auditOf(api), []);
  });

  it('Given a resolved report linked to an enquiry, when an operator tries to open the enquiry, then the answer is 403 and nothing is recorded (L2-034.3)', async () => {
    const { api, leah } = await arranged();
    assert.equal((await leah.post('/api/operator/reports/R-2041/resolve', { decision: 'dismiss', note: 'Reviewed; it stays.' })).status, 200);
    const before = (await auditOf(api)).length;
    assert.equal((await leah.post('/api/operator/reports/R-2041/enquiry', { reason: 'Checking the event.' })).status, 403);
    assert.equal((await auditOf(api)).length, before);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi, type Api } from '../support/api.ts';
import { auditOf, put, putCastReports, scenario } from './support.ts';

const LEAH = 'leah@sweethand.example';
const BEV = 'beverley@auntiebevs.example';
const caterer = async (api: Api, id: string) => (await documents(api, 'caterers')).find((c) => c.id === id);

describe('moderation gaps (moderation designs)', () => {
  it('Given a report about a review, when an operator picks an action that does not fit it, then it is refused and nothing changes (handle-reports design)', async () => {
    const api = await startApi();
    await putCastReports(api);
    const leah = await signedInClient(api, LEAH);
    for (const action of ['suspend', undefined]) {
      const res = await leah.post('/api/operator/reports/R-2041/resolve', { decision: 'action', action, note: 'Not about the review' });
      assert.equal(res.status, 400);
      assert.deepEqual(res.body.errors, { action: ['Choose an action'] });
    }
    assert.equal((await leah.post('/api/operator/reports/R-2047/resolve', { decision: 'action', action: 'hide', note: 'Wrong kind' })).status, 400);
    assert.deepEqual(await auditOf(api), []);
  });

  it('Given an operator acts on a report, when the audit log is read, then the action and the resolution are both there, under the design’s keys (L2-060.1, query-audit-log design)', async () => {
    const api = await startApi();
    await putCastReports(api);
    const leah = await signedInClient(api, LEAH);
    await leah.post('/api/operator/reports/R-2041/resolve', { decision: 'action', action: 'hide', note: 'Personal attack on the owner’s family' });
    const entries = await auditOf(api);
    const hide = entries.find((e) => e.action === 'HideReview');
    const resolved = entries.find((e) => e.action === 'ResolveReports');
    assert.equal(resolved.targetType, 'report');
    assert.equal(resolved.after.actionAuditEntryId, hide.id);
    const page = await leah.get('/api/operator/audit-log?action=resolve-report&from=2026-10-10&to=2026-10-10');
    assert.equal(page.body.entries.length, 1);
    assert.equal(page.body.entries[0].targetLabel, 'Report on Maracas Bay');
  });

  it('Given changes requested on a profile, when the audit log is filtered by Request changes, then the live entry is found and named (L2-060.3)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    await leah.post('/api/operator/profiles/cat-910/request-changes', { reason: 'Photos 2 and 5 show stock images' });
    const page = await leah.get('/api/operator/audit-log?action=RequestChanges&from=2026-10-10&to=2026-10-10');
    assert.equal(page.body.entries.length, 1);
    assert.equal(page.body.entries[0].targetLabel, 'Auntie Bev’s Kitchen');
  });

  it('Given a reversed or malformed date range, when the audit log is searched, then it is refused field by field (query-audit-log AuditLogFilter)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    const reversed = await leah.get('/api/operator/audit-log?from=2026-10-10&to=2026-10-01');
    assert.equal(reversed.status, 400);
    assert.deepEqual(reversed.body.errors, { to: ['End date must be on or after the start date'] });
    const malformed = await leah.get('/api/operator/audit-log?from=10/10/2026');
    assert.equal(malformed.status, 400);
    assert.deepEqual(malformed.body.errors, { from: ['Enter a date like 2026-10-10'] });
  });

  it('Given an Admin deactivates an operator with a reason, when it is saved, then the audit entry keeps the reason (manage-operator-accounts design)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    const res = await leah.post('/api/operator/accounts/user-tomas/deactivate', { reason: 'Left the team at the end of the season' });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal((await auditOf(api)).find((e) => e.action === 'DeactivateOperator').reason, 'Left the team at the end of the season');
  });

  it('Given a photo removal that leaves too few, when it is saved, then the caterer’s editor shows the replacement deadline (L2-057.2)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    const photos = (await caterer(api, 'cat-005')).photos;
    await put(api, 'caterers', { ...(await caterer(api, 'cat-005')), photos: photos.slice(0, 3) });
    const res = await leah.request('DELETE', `/api/operator/profiles/cat-005/photos/${photos[2].id}`, { reason: 'Shows a phone number on the menu board' });
    assert.equal(res.body.replaceBy, '2026-10-24');
    const own = await (await signedInClient(api, 'paulette@blackcakeco.example')).get('/api/caterer/profile');
    assert.ok(own.body.attention.some((a: { key: string; note: string }) => a.key === 'photos' && a.note.includes('2026-10-24')), JSON.stringify(own.body.attention));
  });

  it('Given a caterer changes a dish price and a photo caption after changes were requested, when an operator opens the resubmission, then both count as changed (L2-047.3)', async () => {
    const api = await startApi();
    await scenario(api, 'beverley', { state: 'pending' });
    const leah = await signedInClient(api, LEAH);
    assert.equal((await leah.post('/api/operator/profiles/cat-bev/request-changes', { reason: 'Photos 2 and 5 show stock images' })).status, 200);
    const bev = await caterer(api, 'cat-bev');
    await put(api, 'caterers', {
      ...bev,
      dishes: bev.dishes.map((d: any, i: number) => (i === 0 ? { ...d, price: '$99 per tray' } : d)),
      photos: bev.photos.map((p: any, i: number) => (i === 0 ? { ...p, caption: 'Oxtail with butter beans, plated' } : p)),
    });
    assert.equal((await (await signedInClient(api, BEV)).post('/api/caterer/profile/submission')).status, 200);
    const v = (await leah.get('/api/operator/queue/profiles/cat-bev')).body;
    assert.equal(v.resubmitted, true);
    assert.equal(v.changedFields, 2);
  });
});

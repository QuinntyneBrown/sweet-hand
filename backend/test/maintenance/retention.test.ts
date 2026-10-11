import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, outbox, signedInClient, startApi, type Api } from '../support/api.ts';
import { runDailyMaintenance } from '../../src/maintenance/daily.ts';

const DAY = 24 * 60 * 60_000;
const ago = (api: Api, days: number) => new Date(api.env.clock.now().getTime() - days * DAY).toISOString();
const put = (api: Api, collection: string, doc: Record<string, unknown>) => api.env.db.transaction((tx) => tx.collection<any>(collection).put(doc as any));
const latestRun = async (api: Api) => (await documents(api, 'retentionRuns')).sort((a, b) => a.startedAt.localeCompare(b.startedAt)).at(-1);
const ids = async (api: Api, collection: string) => new Set((await documents(api, collection)).map((d) => d.id));

describe('enforce retention limits (enforce-retention design, L2-073)', () => {
  it('Given records past their retention period, when the daily job runs, then they are deleted, newer ones stay and the run is recorded with a count per category', async () => {
    const api = await startApi();
    const [template] = await documents(api, 'enquiries');
    const closedAt = (days: number) => [{ id: `ev-${days}`, kind: 'closed', by: 'customer', at: ago(api, days) }];
    await put(api, 'enquiries', { ...template, id: 'enq-old', status: 'Closed', events: closedAt(3 * 366) });
    await put(api, 'enquiries', { ...template, id: 'enq-recent', status: 'Closed', events: closedAt(3 * 360) });
    await put(api, 'enquiries', { ...template, id: 'enq-declined-old', status: 'Declined', events: [{ id: 'ev-d', kind: 'declined', by: 'caterer', at: ago(api, 3 * 366) }] });
    await put(api, 'securityEvents', { id: 'sec-old', type: 'sign-in-failure', at: ago(api, 400), seq: 1 });
    await put(api, 'securityEvents', { id: 'sec-recent', type: 'sign-in-failure', at: ago(api, 380), seq: 2 });
    await put(api, 'audit', { id: 'aud-old', at: ago(api, 7 * 366), seq: 1, operatorId: 'user-leah', action: 'Approve', targetType: 'caterer', targetId: 'cat-001', reason: null, before: null, after: null });
    await put(api, 'audit', { id: 'aud-recent', at: ago(api, 7 * 364), seq: 2, operatorId: 'user-leah', action: 'Approve', targetType: 'caterer', targetId: 'cat-001', reason: null, before: null, after: null });
    await put(api, 'visits', { id: 'vis-old', dailyHash: 'x', pageType: 'home', occurredAt: ago(api, 25 * 31) });
    await put(api, 'visits', { id: 'vis-recent', dailyHash: 'y', pageType: 'home', occurredAt: ago(api, 25 * 30) });

    await runDailyMaintenance(api.env);

    const enquiries = await ids(api, 'enquiries');
    assert.deepEqual([enquiries.has('enq-old'), enquiries.has('enq-declined-old'), enquiries.has('enq-recent')], [false, false, true]);
    assert.ok(enquiries.has(template.id), 'open and recent enquiries stay');
    const security = await ids(api, 'securityEvents');
    assert.deepEqual([security.has('sec-old'), security.has('sec-recent')], [false, true]);
    const audit = await ids(api, 'audit');
    assert.deepEqual([audit.has('aud-old'), audit.has('aud-recent')], [false, true]);
    const visits = await ids(api, 'visits');
    assert.deepEqual([visits.has('vis-old'), visits.has('vis-recent')], [false, true]);

    const [run] = await documents(api, 'retentionRuns');
    assert.equal(run.startedAt, api.env.clock.now().toISOString());
    assert.ok(run.finishedAt);
    assert.deepEqual(run.categories.enquiries, { deleted: 2 });
    assert.deepEqual(run.categories['security-logs'], { deleted: 1 });
    assert.deepEqual(run.categories['audit-log'], { deleted: 1 });
    assert.deepEqual(run.categories['visit-analytics'], { deleted: 1 });
    assert.equal(run.categories['inactive-accounts'].deleted, 0);
  });

  it('Given an account with no sign-in for 2 years and 11 months, when the daily job runs, then its owner is warned once and the account is deleted 30 days later (L2-073.2)', async () => {
    const api = await startApi();
    await signedInClient(api, 'marcia.t@example.com');
    const marcia = () => documents(api, 'users').then((us) => us.find((u) => u.id === 'user-marcia'));
    assert.equal((await marcia()).lastSignInAt, api.env.clock.now().toISOString());

    advanceClock(api, 1060 * DAY);
    await runDailyMaintenance(api.env);
    assert.equal((await outbox(api)).filter((m) => m.kind === 'inactivity-warning' && m.to === 'marcia.t@example.com').length, 0, 'not yet 2 years 11 months');

    advanceClock(api, 10 * DAY);
    await runDailyMaintenance(api.env);
    await runDailyMaintenance(api.env);
    const warnings = (await outbox(api)).filter((m) => m.kind === 'inactivity-warning' && m.to === 'marcia.t@example.com');
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0].link, '/sign-in');
    assert.ok((await marcia()).inactivityWarnedAt);
    assert.equal((await latestRun(api)).categories['inactive-accounts'].deleted, 0);

    advanceClock(api, 30 * DAY);
    await runDailyMaintenance(api.env);
    const deleted = await marcia();
    assert.equal(deleted.deleted, true);
    assert.equal(deleted.email, '');
    assert.equal((await documents(api, 'reviews')).filter((r) => r.authorUserId === 'user-marcia').length, 0);
    assert.ok((await latestRun(api)).categories['inactive-accounts'].deleted >= 1);
    assert.ok((await outbox(api)).some((m) => m.kind === 'account-deleted'));
  });

  it('Given a warned account, when its owner signs in, then the warning is cleared and the account is not deleted (L2-073.2)', async () => {
    const api = await startApi();
    await signedInClient(api, 'andre.c@example.com');
    advanceClock(api, 1070 * DAY);
    await runDailyMaintenance(api.env);
    const andre = () => documents(api, 'users').then((us) => us.find((u) => u.emailKey === 'andre.c@example.com'));
    assert.ok((await andre()).inactivityWarnedAt);

    await signedInClient(api, 'andre.c@example.com');
    assert.equal((await andre()).inactivityWarnedAt, undefined);
    advanceClock(api, 30 * DAY);
    await runDailyMaintenance(api.env);
    assert.equal((await andre()).deleted, undefined);
  });

  it('Given operators who have not signed in for years, when the daily job runs, then operator accounts are neither warned nor deleted', async () => {
    const api = await startApi();
    advanceClock(api, 1200 * DAY);
    await runDailyMaintenance(api.env);
    advanceClock(api, 31 * DAY);
    await runDailyMaintenance(api.env);
    const leah = (await documents(api, 'users')).find((u) => u.emailKey === 'leah@sweethand.example');
    assert.equal(leah.deleted, undefined);
    assert.equal(leah.inactivityWarnedAt, undefined);
  });
});

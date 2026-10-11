import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signedInClient, startApi, type Api } from '../support/api.ts';
import { allScenarios } from '../../src/testing/scenarios/index.ts';

const TOMAS = 'tomas@sweethand.example';
const SIX_WEEKS = 'from=2026-08-31&to=2026-10-10&granularity=week';
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const scenario = (api: Api, name: string) => api.env.db.transaction((tx) => Promise.resolve(allScenarios[name]({ tx, now: api.env.clock.now(), env: api.env }, {})));

describe('metrics dashboard (L2-061)', async () => {
  const api = await startApi();
  const tomas = await signedInClient(api, TOMAS);

  it('Given the six weeks to today, when an operator views them by week, then visits, publications and caterers by status come per Monday-to-Sunday week', async () => {
    const res = await tomas.get(`/api/operator/metrics?${SIX_WEEKS}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.from, '2026-08-31');
    assert.equal(res.body.to, '2026-10-10');
    assert.equal(res.body.granularity, 'week');
    assert.equal(res.body.countingSince, '2026-08-03');
    assert.equal(res.body.hasData, true);
    assert.deepEqual(res.body.buckets.map((b: { start: string }) => b.start), ['2026-08-31', '2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28', '2026-10-05']);
    assert.deepEqual(res.body.buckets.map((b: { current: boolean }) => b.current), [false, false, false, false, false, true]);
    assert.equal(sum(res.body.listingVisits), 22670);
    assert.equal(sum(res.body.catererVisits), 39700);
    assert.equal(res.body.listingVisits[4], 4240);
    assert.equal(res.body.uniqueVisitors[4], 2890);
    assert.deepEqual(res.body.newPublished, [1, 0, 2, 0, 1, 0]);
    assert.deepEqual(res.body.statuses, [
      { status: 'Published', count: 60 },
      { status: 'Pending review', count: 3 },
      { status: 'Changes requested', count: 1 },
      { status: 'Draft', count: 9 },
      { status: 'Suspended', count: 1 },
      { status: 'Removed', count: 2 },
    ]);
  });

  it('Given known test data, when enquiries are viewed by week, then the week of 28 Sep shows 12 and replies within 48 hours count once 48 hours have passed (L2-061.1)', async () => {
    const res = await tomas.get(`/api/operator/metrics/enquiries?${SIX_WEEKS}`);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.enquiries, [8, 11, 15, 13, 12, 12]);
    assert.deepEqual(res.body.repliedShare, [75, 82, 80, 85, 83, 88]);
    assert.equal(res.body.repliedOverall, 82);
    assert.equal(res.body.buckets.length, 6);
  });

  it('Given month and day granularity, when they are chosen, then buckets are calendar months and single days in Toronto', async () => {
    const months = await tomas.get('/api/operator/metrics/enquiries?from=2026-08-31&to=2026-10-10&granularity=month');
    const days = await tomas.get('/api/operator/metrics/enquiries?from=2026-10-05&to=2026-10-10&granularity=day');

    assert.deepEqual(months.body.buckets.map((b: { start: string }) => b.start), ['2026-08-01', '2026-09-01', '2026-10-01']);
    assert.deepEqual(months.body.enquiries, [1, 52, 18]);
    assert.deepEqual(days.body.enquiries, [3, 3, 2, 2, 1, 1]);
    assert.equal(days.body.buckets.at(-1).current, true);
  });

  it('Given a range ending earlier, when it is viewed, then Published is the count at the end of that range', async () => {
    const res = await tomas.get('/api/operator/metrics?from=2026-09-01&to=2026-09-27&granularity=week');

    assert.deepEqual(res.body.statuses[0], { status: 'Published', count: 59 });
    assert.equal(res.body.buckets.at(-1).current, false);
  });

  it('Given a 12-month range by day, when it is asked for, then every day comes back quickly (L2-061.4)', async () => {
    const started = Date.now();
    const res = await tomas.get('/api/operator/metrics?from=2025-10-11&to=2026-10-10&granularity=day');

    assert.equal(res.body.buckets.length, 365);
    assert.equal(res.body.uniqueVisitors.length, 365);
    assert.ok(Date.now() - started < 1000);
  });

  it('Given a range before counting began, when it is viewed, then there is no data to chart', async () => {
    const res = await tomas.get('/api/operator/metrics?from=2026-06-01&to=2026-07-31&granularity=week');

    assert.equal(res.body.hasData, false);
    assert.equal(sum(res.body.listingVisits), 0);
  });

  it('Given an invalid range, when it is asked for, then it is refused by field (L2-061.2)', async () => {
    const errors = async (query: string) => (await tomas.get(`/api/operator/metrics?${query}`)).body.errors;

    assert.deepEqual(await errors('from=2024-01-01&to=2026-10-10&granularity=week'), { from: ['Choose a range of 24 months or less'] });
    assert.deepEqual(await errors('to=2026-10-10'), { from: ['Enter a From date'] });
    assert.deepEqual(await errors('from=2026-10-01'), { to: ['Enter a To date'] });
    assert.deepEqual(await errors('from=2026-10-01&to=2026-10-11'), { to: ['Choose dates up to today'] });
    assert.deepEqual(await errors('from=2026-10-05&to=2026-10-01'), { from: ['Choose a From date on or before the To date'] });
    assert.equal((await tomas.get('/api/operator/metrics/enquiries?from=2024-01-01&to=2026-10-10')).status, 400);
    assert.equal((await tomas.get('/api/operator/metrics/export.csv?from=2024-01-01&to=2026-10-10')).status, 400);
    assert.equal((await tomas.get('/api/operator/metrics?from=2026-10-01&to=2026-10-10&granularity=hour')).body.granularity, 'week');
  });
});

describe('metrics export (L2-063)', () => {
  it('Given a range and granularity, when the CSV is exported, then a UTF-8 file comes with a header row and one row per week holding every metric (L2-063.1)', async () => {
    const api = await startApi();
    const tomas = await signedInClient(api, TOMAS);

    const res = await tomas.get(`/api/operator/metrics/export.csv?${SIX_WEEKS}`);

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'text/csv; charset=utf-8');
    assert.equal(res.headers.get('content-disposition'), 'attachment; filename="sweet-hand-metrics-2026-08-31-to-2026-10-10-weekly.csv"');
    assert.equal(res.headers.get('cache-control'), 'no-store');
    const lines = (res.body as string).split('\r\n');
    assert.equal(lines.pop(), '');
    assert.equal(lines.length, 7);
    assert.equal(
      lines[0],
      '"Period start","Listing page visits","Caterer page visits","Unique visitors","Enquiries","Replied within 48 hours (%)","New caterers published","Published","Pending review","Changes requested","Draft","Suspended","Removed"',
    );
    assert.equal(lines[4], '"2026-09-21","3910","6880","2640","13","85","0","59","3","1","9","1","2"');
    assert.equal(lines[5], '"2026-09-28","4240","7350","2890","12","83","1","60","3","1","9","1","2"');
  });

  it('Given a stored value that starts like a formula, when it is exported, then it is written as text (L2-063.2)', async () => {
    const api = await startApi();
    await scenario(api, 'metrics-formula-in-data');
    const tomas = await signedInClient(api, TOMAS);

    const res = await tomas.get('/api/operator/metrics/export.csv?from=2026-10-05&to=2026-10-10&granularity=month');

    const [header] = (res.body as string).split('\r\n');
    assert.ok(header.includes('"\'=HYPERLINK(""https://example.com"",""Pending review"")"'));
    assert.match(res.headers.get('content-disposition')!, /-monthly\.csv"$/);
  });
});

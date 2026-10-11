import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, outbox, startApi } from '../support/api.ts';
import { runDailyMaintenance } from '../../src/maintenance/daily.ts';
import { torontoDate } from '../../src/discovery/listing.ts';

const DAY = 24 * 60 * 60_000;
const plusDays = (date: string, days: number) => new Date(Date.parse(`${date}T12:00:00Z`) + days * DAY).toISOString().slice(0, 10);

describe('daily maintenance (decline-or-close-enquiry and provide-food-handler-certificate designs)', () => {
  it('Given open or replied enquiries 30 days past their event, when the daily job runs, then they close by the system and nothing else changes (L2-033.4)', async () => {
    const api = await startApi();
    advanceClock(api, 60 * DAY);
    const today = torontoDate(api.env.clock.now());
    const before = await documents(api, 'enquiries');
    const due = before.filter((e) => (e.status === 'Open' || e.status === 'Replied') && plusDays(e.eventDate, 30) <= today);
    assert.ok(due.length > 0, 'the cast has a stale enquiry');

    await runDailyMaintenance(api.env);

    const after = new Map((await documents(api, 'enquiries')).map((e) => [e.id, e]));
    for (const e of before) {
      const now = after.get(e.id);
      if (due.some((d) => d.id === e.id)) {
        assert.equal(now.status, 'Closed');
        assert.deepEqual([now.events.at(-1).kind, now.events.at(-1).by], ['closed', 'system']);
      } else assert.equal(now.status, e.status);
    }
    await runDailyMaintenance(api.env);
    for (const d of due) assert.equal((await documents(api, 'enquiries')).find((e) => e.id === d.id).events.filter((x: { kind: string }) => x.kind === 'closed').length, 1, 'closed once');
  });

  it('Given a certificate expiring in 30 and then 7 days, when the daily job runs, then the caterer gets one reminder each time and never twice (L2-040.2)', async () => {
    const api = await startApi();
    const reminders = async () => (await outbox(api)).filter((m) => m.kind === 'certificate-reminder' && m.to === 'desmond@coucou.example');

    await runDailyMaintenance(api.env);
    await runDailyMaintenance(api.env);
    assert.equal((await reminders()).length, 1);
    assert.equal((await reminders())[0].expires, '2026-11-09');

    advanceClock(api, 23 * DAY);
    await runDailyMaintenance(api.env);
    assert.equal((await reminders()).length, 2);
    advanceClock(api, DAY);
    await runDailyMaintenance(api.env);
    assert.equal((await reminders()).length, 2);
    const log = (await documents(api, 'certificateExpiries')).find((x) => x.id === 'cat-002');
    assert.equal(log.reminders.length, 2);
  });

  it('Given a published caterer whose certificate has expired, when the daily job runs, then the expiry is recorded for the operator queue and the profile stays published (L2-040.3)', async () => {
    const api = await startApi();
    advanceClock(api, 31 * DAY);
    await runDailyMaintenance(api.env);
    const found = (await documents(api, 'certificateExpiries')).find((x) => x.id === 'cat-002');
    assert.equal(found.detectedAt, api.env.clock.now().toISOString());
    assert.equal((await documents(api, 'caterers')).find((c) => c.id === 'cat-002').status, 'Published');
  });
});

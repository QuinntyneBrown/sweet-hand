import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, startApi, type Api } from '../support/api.ts';
import { aggregateMetrics } from '../../src/operator-settings/metrics-aggregation.ts';
import { torontoDate } from '../../src/discovery/listing.ts';

const HOUR = 60 * 60_000;
const put = (api: Api, collection: string, doc: Record<string, unknown>) => api.env.db.transaction((tx) => tx.collection<any>(collection).put(doc as any));

describe('aggregate daily metrics (view-metrics-dashboard design, L2-061.3)', () => {
  it('Given enquiries, replies, publications and statuses today, when the aggregation runs, then today’s figures come from the records and visits already counted stay', async () => {
    const api = await startApi();
    const now = api.env.clock.now();
    const today = torontoDate(now);
    const before = (await documents(api, 'dailyMetrics')).find((m) => m.id === today);
    const [template] = await documents(api, 'enquiries');
    const at = (ms: number) => new Date(now.getTime() + ms).toISOString();
    await put(api, 'enquiries', { ...template, id: 'enq-new-1', createdAt: at(-HOUR), status: 'Replied', events: [{ id: 'r1', kind: 'reply', by: 'caterer', at: at(-HOUR / 2) }] });
    await put(api, 'enquiries', { ...template, id: 'enq-new-2', createdAt: at(-HOUR), status: 'Open', events: [] });
    const caterers = await documents(api, 'caterers');
    await put(api, 'caterers', { ...caterers.find((c) => c.status === 'Pending review'), status: 'Published', publishedAt: at(-HOUR) });

    await aggregateMetrics(api.env);
    await aggregateMetrics(api.env);

    const enquiries = (await documents(api, 'enquiries')).filter((e) => torontoDate(new Date(e.createdAt)) === today);
    const row = (await documents(api, 'dailyMetrics')).find((m) => m.id === today);
    assert.equal(row.enquiries, enquiries.length);
    assert.ok(row.replied >= 1 && row.replied <= row.enquiries);
    const published = (await documents(api, 'caterers')).filter((c) => c.publishedAt && torontoDate(new Date(c.publishedAt)) === today).length;
    assert.equal(row.published, published);
    assert.equal(row.listing, before?.listing ?? 0);

    const counts = new Map<string, number>();
    for (const c of await documents(api, 'caterers')) counts.set(c.status, (counts.get(c.status) ?? 0) + 1);
    const state = (await documents(api, 'metricsState'))[0];
    assert.equal(state.statuses[0].status, 'Published');
    assert.deepEqual(Object.fromEntries(state.statuses.map((s: { status: string; count: number }) => [s.status, s.count])), Object.fromEntries([...counts].filter(([, n]) => n > 0)));
  });
});

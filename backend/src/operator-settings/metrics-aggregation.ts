import type { Environment } from '../environment.ts';
import { torontoDate } from '../discovery/listing.ts';
import { enquiries, type Enquiry } from '../enquiries/model.ts';
import { caterers } from '../caterers/model.ts';
import { dailyMetrics, metricsState, METRICS_STATE_ID } from './model.ts';

const DAY_MS = 24 * 60 * 60_000;
const REPLY_WINDOW_MS = 48 * 60 * 60_000;
/** The dashboard lists statuses in this order, Published first. */
const STATUS_ORDER = ['Published', 'Pending review', 'Changes requested', 'Draft', 'Suspended', 'Removed'];

const dayOf = (iso: string) => torontoDate(new Date(iso));

/** The caterer's first reply came within 48 hours of the enquiry. */
function repliedInTime(e: Enquiry): boolean {
  const first = e.events.find((ev) => ev.kind === 'reply' && ev.by === 'caterer');
  return !!first && Date.parse(first.at) - Date.parse(e.createdAt) <= REPLY_WINDOW_MS;
}

/**
 * AggregateMetricsJob with DailyMetricsAggregator: recomputes today and the 2
 * days before from the records (enquiries, first replies within 48 hours,
 * first publications) and caterers by status, so the dashboard follows within
 * the hour (L2-061.3). Visits are already counted live from the visit records,
 * so the visit figures of a row are kept. Upserts make reruns idempotent.
 */
export async function aggregateMetrics(env: Environment): Promise<void> {
  const now = env.clock.now();
  const days = [0, 1, 2].map((n) => torontoDate(new Date(now.getTime() - n * DAY_MS)));
  await env.db.transaction(async (tx) => {
    const allEnquiries = await enquiries(tx).all();
    const allCaterers = await caterers(tx).all();
    for (const day of days) {
      const created = allEnquiries.filter((e) => dayOf(e.createdAt) === day);
      const existing = await dailyMetrics(tx).get(day);
      await dailyMetrics(tx).put({
        id: day,
        listing: existing?.listing ?? 0,
        caterer: existing?.caterer ?? 0,
        unique: existing?.unique ?? 0,
        enquiries: created.length,
        replied: created.filter(repliedInTime).length,
        published: allCaterers.filter((c) => c.publishedAt && dayOf(c.publishedAt) === day).length,
      });
    }
    const counts = new Map<string, number>();
    for (const c of allCaterers) counts.set(c.status, (counts.get(c.status) ?? 0) + 1);
    const rank = (s: string) => (STATUS_ORDER.includes(s) ? STATUS_ORDER.indexOf(s) : STATUS_ORDER.length);
    const statuses = [...counts].sort(([a], [b]) => rank(a) - rank(b)).map(([status, count]) => ({ status, count }));
    const state = await metricsState(tx).get(METRICS_STATE_ID);
    await metricsState(tx).put({ id: METRICS_STATE_ID, countingSince: state?.countingSince ?? days[0], statuses });
  });
}

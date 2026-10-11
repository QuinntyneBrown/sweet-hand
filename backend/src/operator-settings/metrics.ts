import type { Request, Reply } from '../http/endpoint.ts';
import { fail, invalid, ok } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { torontoDate } from '../discovery/listing.ts';
import type { EnquiryMetrics } from '@contract/enquiry-metrics.ts';
import type { Granularity } from '@contract/granularity.ts';
import type { MetricsBucket } from '@contract/metrics-bucket.ts';
import type { MetricsReport } from '@contract/metrics-report.ts';
import { dailyMetrics, metricsState, METRICS_STATE_ID, type DailyMetrics, type MetricsState } from './model.ts';
import { visitsByDay } from './visits.ts';

/** view-metrics-dashboard and export-metrics (L2-061, L2-063). */

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T12:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);

/** The same day 24 months earlier: the earliest From a range may have (L2-061.2). */
function twoYearsBefore(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${y - 2}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** The bucket a day falls in: itself, its week's Monday or its month's first day. */
function bucketOf(date: string, granularity: Granularity): string {
  if (granularity === 'day') return date;
  if (granularity === 'month') return `${date.slice(0, 7)}-01`;
  const weekday = (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
  return addDays(date, -weekday);
}

interface Range {
  from: string;
  to: string;
  granularity: Granularity;
}

/** MetricsRange: a valid range of 24 months or less, up to today. Refuses the request otherwise. */
function metricsRange(req: Request): Range {
  const from = req.query.get('from') ?? '';
  const to = req.query.get('to') ?? '';
  const g = req.query.get('granularity');
  const granularity: Granularity = g === 'day' || g === 'month' ? g : 'week';
  const today = torontoDate(req.now);
  const valid = (d: string) => DATE.test(d) && !Number.isNaN(Date.parse(d));
  if (!valid(from)) fail(invalid({ from: ['Enter a From date'] }));
  if (!valid(to)) fail(invalid({ to: ['Enter a To date'] }));
  if (to > today || from > today) fail(invalid({ [to > today ? 'to' : 'from']: ['Choose dates up to today'] }));
  if (from > to) fail(invalid({ from: ['Choose a From date on or before the To date'] }));
  if (from < twoYearsBefore(to)) fail(invalid({ from: ['Choose a range of 24 months or less'] }));
  return { from, to, granularity };
}

/** The range's figures: buckets, the days in each, and the daily aggregates. */
class Figures {
  readonly buckets: MetricsBucket[];
  readonly days: string[][];
  readonly range: Range;
  readonly today: string;
  private readonly daily: Map<string, DailyMetrics>;
  private readonly visits: Map<string, { listing: number; caterer: number; unique: number }>;
  private readonly state: MetricsState;

  constructor(range: Range, today: string, daily: DailyMetrics[], visits: Figures['visits'], state: MetricsState) {
    this.range = range;
    this.today = today;
    this.daily = new Map(daily.map((m) => [m.id, m]));
    this.visits = visits;
    this.state = state;
    const byBucket = new Map<string, string[]>();
    for (let d = range.from; d <= range.to; d = addDays(d, 1)) {
      const key = bucketOf(d, range.granularity);
      const list = byBucket.get(key);
      if (list) list.push(d);
      else byBucket.set(key, [d]);
    }
    const thisBucket = bucketOf(today, range.granularity);
    this.buckets = [...byBucket.keys()].map((start) => ({ start, current: start === thisBucket }));
    this.days = [...byBucket.values()];
  }

  static async load(tx: Transaction, range: Range, now: Date): Promise<Figures> {
    const state = (await metricsState(tx).get(METRICS_STATE_ID)) ?? { id: METRICS_STATE_ID, countingSince: torontoDate(now), statuses: [] };
    return new Figures(range, torontoDate(now), await dailyMetrics(tx).all(), await visitsByDay(tx), state);
  }

  /** Daily aggregates plus the visits recorded since, so a visit shows straight away (L2-061.3). */
  private sum(key: 'listing' | 'caterer' | 'unique' | 'published'): number[] {
    const live = (d: string) => (key === 'published' ? 0 : (this.visits.get(d)?.[key] ?? 0));
    return this.days.map((days) => days.reduce((n, d) => n + (this.daily.get(d)?.[key] ?? 0) + live(d), 0));
  }

  /** Caterers by status at the end of a day: Published from the publication history, the rest as last aggregated. */
  statusesAt(date: string): { status: string; count: number }[] {
    const [published, ...others] = this.state.statuses;
    if (!published) return [];
    let later = 0;
    for (const m of this.daily.values()) if (m.id > date) later += m.published;
    return [{ status: published.status, count: published.count - later }, ...others];
  }

  report(): MetricsReport {
    const { from, to, granularity } = this.range;
    return {
      from,
      to,
      granularity,
      countingSince: this.state.countingSince,
      hasData: to >= this.state.countingSince,
      buckets: this.buckets,
      listingVisits: this.sum('listing'),
      catererVisits: this.sum('caterer'),
      uniqueVisitors: this.sum('unique'),
      newPublished: this.sum('published'),
      statuses: this.statusesAt(to),
    };
  }

  enquiries(): EnquiryMetrics {
    // An enquiry counts toward the share once 48 hours have passed (view-metrics-dashboard).
    const due = addDays(this.today, -3);
    const tally = (days: string[]) =>
      days.reduce(
        (t, d) => {
          const m = this.daily.get(d);
          if (!m) return t;
          const counted = d <= due;
          return { enquiries: t.enquiries + m.enquiries, eligible: t.eligible + (counted ? m.enquiries : 0), replied: t.replied + (counted ? m.replied : 0) };
        },
        { enquiries: 0, eligible: 0, replied: 0 },
      );
    const share = (t: { eligible: number; replied: number }) => (t.eligible ? Math.round((t.replied / t.eligible) * 100) : null);
    const perBucket = this.days.map(tally);
    return {
      buckets: this.buckets,
      enquiries: perBucket.map((t) => t.enquiries),
      repliedShare: perBucket.map(share),
      repliedOverall: share(tally(this.days.flat())),
    };
  }
}

export async function metricsReport(req: Request): Promise<Reply> {
  const range = metricsRange(req);
  return ok((await Figures.load(req.tx, range, req.now)).report());
}

export async function enquiryMetrics(req: Request): Promise<Reply> {
  const range = metricsRange(req);
  return ok((await Figures.load(req.tx, range, req.now)).enquiries());
}

/** CsvFormulaGuard: a value starting with =, +, -, @, tab or carriage return is read as text; every field is quoted (L2-063.2). */
export function csvField(value: string | number | null): string {
  let text = value === null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

const PERIOD: Record<Granularity, string> = { day: 'daily', week: 'weekly', month: 'monthly' };

/** One row per bucket, one column per metric and per status; UTF-8, not cacheable (L2-063.1). */
export async function exportMetrics(req: Request): Promise<Reply> {
  const range = metricsRange(req);
  const figures = await Figures.load(req.tx, range, req.now);
  const report = figures.report();
  const enquiries = figures.enquiries();
  const header = [
    'Period start',
    'Listing page visits',
    'Caterer page visits',
    'Unique visitors',
    'Enquiries',
    'Replied within 48 hours (%)',
    'New caterers published',
    ...report.statuses.map((s) => s.status),
  ];
  const rows = report.buckets.map((b, i) => {
    // Caterers by status at the end of each bucket (export-metrics).
    const last = report.buckets[i + 1] ? addDays(report.buckets[i + 1].start, -1) : range.to;
    return [
      b.start,
      report.listingVisits[i],
      report.catererVisits[i],
      report.uniqueVisitors[i],
      enquiries.enquiries[i],
      enquiries.repliedShare[i],
      report.newPublished[i],
      ...figures.statusesAt(last).map((s) => s.count),
    ];
  });
  const csv = [header, ...rows].map((row) => row.map(csvField).join(',')).join('\r\n') + '\r\n';
  return {
    status: 200,
    raw: csv,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="sweet-hand-metrics-${range.from}-to-${range.to}-${PERIOD[range.granularity]}.csv"`,
      'cache-control': 'no-store',
    },
  };
}

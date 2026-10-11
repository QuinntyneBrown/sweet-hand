import type { ChartPoint } from '@sweet-hand/components';
import { count, monthYear, shortDate, torontoToday } from '../../../core/format/format';
import { EnquiryMetrics, Granularity, MetricsBucket, MetricsReport } from '@sweet-hand/api';

const DAY_MS = 24 * 60 * 60 * 1000;
const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T12:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The last 6 weeks by week, ending today (docs/mocks/pages/admin-metrics/default.html). */
export function lastSixWeeks(now: Date = new Date()): { from: string; to: string; granularity: Granularity } {
  const to = torontoToday(now);
  const weekday = (new Date(`${to}T12:00:00Z`).getUTCDay() + 6) % 7;
  return { from: addDays(to, -weekday - 35), to, granularity: 'week' };
}

/** The same rules as the server's MetricsRange (L2-061.2); the error belongs to From unless it is To's. */
export function rangeError(from: string, to: string, today: string): { field: 'from' | 'to'; message: string } | null {
  if (!DATE.test(from)) return { field: 'from', message: $localize`:@@metrics.fromRequired:Enter a From date` };
  if (!DATE.test(to)) return { field: 'to', message: $localize`:@@metrics.toRequired:Enter a To date` };
  if (to > today) return { field: 'to', message: $localize`:@@metrics.future:Choose dates up to today` };
  if (from > today) return { field: 'from', message: $localize`:@@metrics.future:Choose dates up to today` };
  if (from > to) return { field: 'from', message: $localize`:@@metrics.order:Choose a From date on or before the To date` };
  const [y, m, d] = to.split('-');
  if (from < `${Number(y) - 2}-${m}-${d}`) return { field: 'from', message: $localize`:@@metrics.tooLong:Choose a range of 24 months or less` };
  return null;
}

const dayMonth = (d: string) => shortDate(d, new Date(0)).replace(/^\S+ /, '').replace(/ \d{4}$/, '');
const dayMonthYear = (d: string) => shortDate(d, new Date(0)).replace(/^\S+ /, '');

/** "31 Aug – 10 Oct 2026 · by week · Toronto time" */
export function rangeSubtitle(from: string, to: string, g: Granularity, withZone: boolean): string {
  const range = from.slice(0, 4) === to.slice(0, 4) ? `${dayMonth(from)} – ${dayMonthYear(to)}` : `${dayMonthYear(from)} – ${dayMonthYear(to)}`;
  const by = g === 'day' ? $localize`:@@metrics.byDay:by day` : g === 'month' ? $localize`:@@metrics.byMonth:by month` : $localize`:@@metrics.byWeek:by week`;
  return withZone ? $localize`:@@metrics.subtitleZone:${range}:range: · ${by}:by: · Toronto time` : $localize`:@@metrics.subtitle:${range}:range: · ${by}:by:`;
}

/** "Caterers by status on 10 Oct 2026" */
export const statusCaption = (to: string) => $localize`:@@metrics.statusCaption:Caterers by status on ${dayMonthYear(to)}:date:`;

/** "Sweet Hand started counting visits and enquiries on 3 Aug 2026. Choose dates from then on." */
export const emptyText = (since: string) =>
  $localize`:@@metrics.emptyText:Sweet Hand started counting visits and enquiries on ${dayMonthYear(since)}:date:. Choose dates from then on.`;

function axisLabel(b: MetricsBucket, g: Granularity): string {
  return g === 'month' ? monthYear(b.start).split(' ')[0]!.slice(0, 3) : dayMonth(b.start);
}

function rowLabel(b: MetricsBucket, g: Granularity): string {
  if (g === 'month') return monthYear(b.start);
  if (g === 'day') return shortDate(b.start);
  return $localize`:@@metrics.weekOf:Week of ${dayMonth(b.start)}:date:`;
}

const periodHeader = (g: Granularity) =>
  g === 'day' ? $localize`:@@metrics.day:Day` : g === 'month' ? $localize`:@@metrics.month:Month` : $localize`:@@metrics.week:Week`;

const byPeriod = (measure: string, g: Granularity) =>
  g === 'day'
    ? $localize`:@@metrics.perDay:${measure}:measure: by day`
    : g === 'month'
      ? $localize`:@@metrics.perMonth:${measure}:measure: by month`
      : $localize`:@@metrics.perWeek:${measure}:measure: by week`;

export const percent = (n: number) => $localize`:@@metrics.percent:${n}:value:%`;

export interface ChartView {
  key: string;
  title: string;
  total: string | null;
  label: string;
  points: ChartPoint[];
  scale: 'count' | 'percent';
  current: boolean;
  periodHeader: string;
  valueHeader: string;
  failed: boolean;
}

const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

function chart(key: string, title: string, valueHeader: string, g: Granularity, buckets: MetricsBucket[], values: readonly (number | null)[] | null, total: string | null, scale: 'count' | 'percent' = 'count'): ChartView {
  const notDue = $localize`:@@metrics.noneDue:none due yet`;
  return {
    key,
    title,
    total: values ? total : null,
    label: byPeriod(title, g),
    points: values
      ? buckets.map((b, i) => {
          const v = values[i];
          return { axis: axisLabel(b, g), row: rowLabel(b, g), value: v ?? 0, display: v === null ? notDue : scale === 'percent' ? percent(v) : count(v) };
        })
      : [],
    scale,
    current: buckets.at(-1)?.current ?? false,
    periodHeader: periodHeader(g),
    valueHeader,
    failed: !values,
  };
}

/** The six charts of L2-061, in the mock's order; enquiry charts fail on their own. */
export function charts(report: MetricsReport, enquiries: EnquiryMetrics | null): ChartView[] {
  const g = report.granularity;
  const b = report.buckets;
  const avg = b.length ? Math.round(sum(report.uniqueVisitors) / b.length) : 0;
  return [
    chart('enquiries', $localize`:@@metrics.enquiries:Enquiries`, $localize`:@@metrics.enquiries:Enquiries`, g, b, enquiries?.enquiries ?? null, count(sum(enquiries?.enquiries ?? []))),
    chart(
      'replied',
      $localize`:@@metrics.replied:Replied within 48 hours`,
      $localize`:@@metrics.shareReplied:Share replied`,
      g,
      b,
      enquiries?.repliedShare ?? null,
      enquiries?.repliedOverall == null ? null : percent(enquiries.repliedOverall),
      'percent',
    ),
    chart('listing', $localize`:@@metrics.listingVisits:Listing page visits`, $localize`:@@metrics.visits:Visits`, g, b, report.listingVisits, count(sum(report.listingVisits))),
    chart('caterer', $localize`:@@metrics.catererVisits:Caterer page visits`, $localize`:@@metrics.visits:Visits`, g, b, report.catererVisits, count(sum(report.catererVisits))),
    chart('unique', $localize`:@@metrics.unique:Unique visitors`, $localize`:@@metrics.visitors:Visitors`, g, b, report.uniqueVisitors, $localize`:@@metrics.average:${count(avg)}:value: avg`),
    chart('published', $localize`:@@metrics.published:New caterers published`, $localize`:@@metrics.publishedColumn:Published`, g, b, report.newPublished, count(sum(report.newPublished))),
  ];
}

/** "+4 in this range" (stat CRD: the consumer formats the delta). */
export function publishedDelta(n: number): { text: string; direction: 'up' | 'down' | null; sentiment: 'good' | 'bad' | null } {
  if (n === 0) return { text: $localize`:@@metrics.noChange:No change in this range`, direction: null, sentiment: null };
  return { text: $localize`:@@metrics.delta:+${count(n)}:value: in this range`, direction: 'up', sentiment: 'good' };
}

/** Status names as they read on the dashboard. */
export function statusName(status: string): string {
  const names: Record<string, string> = {
    Published: $localize`:@@status.published:Published`,
    'Pending review': $localize`:@@status.pending:Pending review`,
    'Changes requested': $localize`:@@status.changesRequested:Changes requested`,
    Draft: $localize`:@@status.draft:Draft`,
    Suspended: $localize`:@@status.suspended:Suspended`,
    Removed: $localize`:@@status.removed:Removed`,
  };
  return names[status] ?? status;
}

export { sum };

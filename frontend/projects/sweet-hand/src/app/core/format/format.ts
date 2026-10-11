/**
 * Dates, times and money as the mocks write them, always in America/Toronto
 * and Canadian English (docs/mocks/README.md, "Cast and catalog"):
 * "Sat 21 Nov", "Saturday 21 November 2026", "9:42 a.m.", "From $18".
 */
export const TIME_ZONE = 'America/Toronto';
const LOCALE = 'en-CA';

function parts(date: Date | string, options: Intl.DateTimeFormatOptions): Record<string, string> {
  const d = typeof date === 'string' ? new Date(date) : date;
  const out: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...options }).formatToParts(d)) out[p.type] = p.value;
  return out;
}

/** A calendar date given as YYYY-MM-DD is read as that day in Toronto, not as UTC midnight. */
function asDate(value: Date | string): Date {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00-05:00`) : new Date(value);
}

/** "Saturday 21 November 2026" */
export function longDate(value: Date | string): string {
  const p = parts(asDate(value), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return `${p['weekday']} ${p['day']} ${p['month']} ${p['year']}`;
}

/** "Sat 21 Nov", with the year when it is not the current year in Toronto. */
export function shortDate(value: Date | string, now: Date = new Date()): string {
  const p = parts(asDate(value), { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const thisYear = parts(now, { year: 'numeric' })['year'];
  const base = `${p['weekday'].replace('.', '')} ${p['day']} ${p['month'].replace('.', '')}`;
  return p['year'] === thisYear ? base : `${base} ${p['year']}`;
}

/** "9:42 a.m." */
export function time(value: Date | string): string {
  const p = parts(value, { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${p['hour']}:${p['minute']} ${(p['dayPeriod'] ?? '').toLowerCase().replace(/\s/g, '').replace('am', 'a.m.').replace('pm', 'p.m.')}`;
}

/** "August 2026" */
export function monthYear(value: Date | string): string {
  const p = parts(asDate(value), { month: 'long', year: 'numeric' });
  return `${p['month']} ${p['year']}`;
}

/** Today's date in Toronto as YYYY-MM-DD. */
export function torontoToday(now: Date = new Date()): string {
  const p = parts(now, { year: 'numeric', month: '2-digit', day: '2-digit' });
  return `${p['year']}-${p['month']}-${p['day']}`;
}

/** "1,250" */
export function count(n: number): string {
  return new Intl.NumberFormat(LOCALE).format(n);
}

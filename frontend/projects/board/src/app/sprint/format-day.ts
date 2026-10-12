const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parts(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  return { weekday: WEEKDAYS[d.getUTCDay()], day: d.getUTCDate(), month: MONTHS[d.getUTCMonth()], year: d.getUTCFullYear() };
}

/** "2026-10-12" → "Mon 12 Oct", as the backlog writes dates. */
export function formatDay(date: string): string {
  const p = parts(date);
  return `${p.weekday} ${p.day} ${p.month}`;
}

/** "2026-10-12" → "Mon 12", for the burndown's axis. */
export function formatAxisDay(date: string): string {
  const p = parts(date);
  return `${p.weekday} ${p.day}`;
}

/** "Mon 12 Oct – Fri 23 Oct 2026" */
export function formatRange(start: string, end: string): string {
  return `${formatDay(start)} – ${formatDay(end)} ${parts(end).year}`;
}

/** Today's date in Toronto as `YYYY-MM-DD`. */
export function torontoToday(now = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
}

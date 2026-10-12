import type { Sprint } from '../backlog/sprint';

/** The sprint's working days, Monday to Friday, as `YYYY-MM-DD`. */
export function sprintDays(sprint: Sprint): string[] {
  const days: string[] = [];
  for (let d = new Date(`${sprint.start}T12:00:00Z`); d <= new Date(`${sprint.end}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

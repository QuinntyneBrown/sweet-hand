import type { Sprint } from '../backlog/sprint';
import type { Story } from '../backlog/story';
import type { CardState } from '../state/card-state';
import { formatDay } from '../sprint/format-day';
import { sprintDays } from '../sprint/sprint-days';

/** A sprint's burndown for the stories shown, as of `today`. */
export interface Burndown {
  days: string[];
  total: number;
  left: number;
  storiesDone: number;
  storiesTotal: number;
  daysLeft: number;
  /** Points remaining at the end of each day up to today; empty before the sprint. */
  remaining: number[];
  /** The ideal points remaining at the end of each day. */
  ideal: number[];
  pace: string;
  tone: 'idle' | 'ok' | 'behind';
  /** Index of today in `days`, or -1 outside the sprint. */
  todayIndex: number;
}

export function burndown(sprint: Sprint, stories: Story[], card: (story: Story) => CardState, today: string): Burndown {
  const days = sprintDays(sprint);
  const total = stories.reduce((sum, s) => sum + s.points, 0);
  const done = stories.filter((s) => card(s).col === 'done');
  const left = total - done.reduce((sum, s) => sum + s.points, 0);
  const remainingOn = (day: string) => total - done.reduce((sum, s) => sum + ((card(s).doneAt ?? '') <= day ? s.points : 0), 0);
  const ideal = days.map((_, i) => (days.length > 1 ? total * (1 - i / (days.length - 1)) : 0));
  const lastIndex = days.reduce((last, day, i) => (day <= today ? i : last), -1);
  const remaining = days.slice(0, lastIndex + 1).map(remainingOn);
  const ended = today > sprint.end;

  let pace: string;
  let tone: Burndown['tone'] = 'idle';
  if (lastIndex < 0) pace = `Starts ${formatDay(days[0] ?? sprint.start)}`;
  else if (ended) pace = `Sprint ended · ${left} pts carried`;
  else {
    const gap = Math.round(remaining[lastIndex] - ideal[lastIndex]);
    tone = gap > 0 ? 'behind' : 'ok';
    pace = gap > 0 ? `Behind ideal by ${gap} pts` : gap < 0 ? `Ahead by ${-gap} pts` : 'On track';
  }

  return {
    days,
    total,
    left,
    storiesDone: done.length,
    storiesTotal: stories.length,
    daysLeft: days.filter((d) => d >= today).length,
    remaining,
    ideal,
    pace,
    tone,
    todayIndex: ended ? -1 : lastIndex,
  };
}

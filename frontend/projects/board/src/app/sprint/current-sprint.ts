import type { Sprint } from '../backlog/sprint';

/** The sprint that holds `today`; between sprints the next one; before them the first and after them the last. */
export function currentSprint(sprints: Sprint[], today: string): Sprint {
  return sprints.find((s) => s.start <= today && today <= s.end) ?? sprints.find((s) => today < s.start) ?? sprints[sprints.length - 1];
}

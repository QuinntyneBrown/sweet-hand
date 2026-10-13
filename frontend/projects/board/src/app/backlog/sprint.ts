/** A sprint: dates are `YYYY-MM-DD`, `stories` are IDs in plan order. */
export interface Sprint {
  number: number;
  name: string;
  start: string;
  end: string;
  goal: string[];
  demo: string[];
  stories: string[];
}

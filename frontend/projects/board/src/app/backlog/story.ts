import type { DodItem } from './dod-item';
import type { Lane } from './lane';

/** A backlog story, as `scripts/backlog-to-board.mjs` reads it from launch-backlog.md. */
export interface Story {
  id: string;
  title: string;
  lane: Lane;
  points: number;
  /** What follows the lane and points on the story's first line, such as "Sprint 1 · Traces: L2-109". */
  meta: string;
  initiative: string;
  epic: string;
  description: string;
  dod: DodItem[];
  tasks: string[];
}

import type { Lane } from './lane';
import type { Sprint } from './sprint';
import type { Story } from './story';

/** The board's data, generated from docs/plans/launch-backlog.md (ADR 0013). */
export interface Backlog {
  sprints: Sprint[];
  laneDod: Record<Lane, string[]>;
  stories: Story[];
}

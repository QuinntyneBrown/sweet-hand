import type { Lane } from '../backlog/lane';
import type { Sprint } from '../backlog/sprint';
import type { Story } from '../backlog/story';

/** What the story details dialog shows. */
export interface CardDialogData {
  story: Story;
  sprint: Sprint;
  laneDod: Record<Lane, string[]>;
}

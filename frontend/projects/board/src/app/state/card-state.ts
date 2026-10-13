import type { ColumnId } from './column-id';

/** Where a story's card is: its column, the day it was done (`YYYY-MM-DD`) and which tasks are ticked. */
export interface CardState {
  col: ColumnId;
  doneAt: string | null;
  ticks: boolean[];
}

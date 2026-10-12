import type { ColumnId } from './column-id';

/** The board's columns, left to right. */
export const COLUMNS: readonly { id: ColumnId; name: string }[] = [
  { id: 'todo', name: 'To do' },
  { id: 'doing', name: 'In progress' },
  { id: 'review', name: 'Review' },
  { id: 'done', name: 'Done' },
];

import type { ChecklistKey } from './checklist-key';

/** A section an operator flagged when asking for changes, with what to do ("Replace photos 2 and 5"). */
export interface AttentionView {
  key: ChecklistKey;
  note: string;
}

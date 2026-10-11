import type { ChecklistKey } from './checklist-key';

export interface ChecklistItemView {
  key: ChecklistKey;
  done: boolean;
}

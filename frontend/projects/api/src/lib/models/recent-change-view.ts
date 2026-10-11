import type { ChangedField } from './changed-field';
import type { ChangeValue } from './change-value';

export interface RecentChangeView {
  id: string;
  catererId: string;
  catererName: string;
  photo: string | null;
  field: ChangedField;
  by: string;
  at: string;
  /** `null`: there was nothing before (a new dish). */
  old: ChangeValue | null;
  new: ChangeValue | null;
  reverted: { by: string; at: string } | null;
}

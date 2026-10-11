import type { ChangedField } from '../../projects/api/src/lib/models/changed-field.ts';
import type { ChangeValue } from '../../projects/api/src/lib/models/change-value.ts';

/** One caterer edit to a published profile (L2-044.1), for the recent-changes feed. */
export interface ProfileEdit {
  id: string;
  catererId: string;
  field: ChangedField;
  by: string;
  at: string;
  old: ChangeValue | null;
  new: ChangeValue | null;
  reverted?: { by: string; at: string };
}

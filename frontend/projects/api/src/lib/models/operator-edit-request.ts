import type { EditableField } from './editable-field';

export interface OperatorEditRequest {
  field: EditableField;
  /** Text for name and description; names for lists; `{ min, max }` for guests. */
  value: string | string[] | { min: number; max: number };
  reason: string;
}

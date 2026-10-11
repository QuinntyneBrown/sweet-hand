import type { Signal } from '@angular/core';

/** What a form field tells the control in its default slot (form-field CRD, "Field context"). */
export interface FieldContext {
  id: Signal<string>;
  describedBy: Signal<string | null>;
  invalid: Signal<boolean>;
}

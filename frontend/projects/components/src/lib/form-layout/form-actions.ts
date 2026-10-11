import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The primary action and an optional save status (form-layout CRD, `sh-form-actions`). */
@Component({
  selector: 'sh-form-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<div [class]="sticky() ? 'form-actions form-actions--sticky' : 'form-actions'"><ng-content /></div>`,
})
export class FormActions {
  readonly sticky = input(false);
}

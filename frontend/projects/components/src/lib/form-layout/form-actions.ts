import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The primary action and an optional save status (form-layout CRD, `sh-form-actions`). */
@Component({
  selector: 'sh-form-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './form-actions.html',
})
export class FormActions {
  readonly sticky = input(false);
}

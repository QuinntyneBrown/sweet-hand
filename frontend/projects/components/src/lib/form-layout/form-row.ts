import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Two fields side by side from SM (form-layout CRD, `sh-form-row`). */
@Component({
  selector: 'sh-form-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<div class="field-row"><ng-content /></div>`,
})
export class FormRow {}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A record in the privacy breach register (list CRD, `sh-breach-record`). Used as an attribute on the `li`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-breach-record]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'breach' },
  templateUrl: './breach-record.html',
})
export class BreachRecord {
  readonly title = input.required<string>();
  readonly headingLevel = input<2 | 3 | 4>(2);
  readonly when = input.required<string>();
}

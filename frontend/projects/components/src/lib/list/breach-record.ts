import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A record in the privacy breach register (list CRD, `sh-breach-record`). Used as an attribute on the `li`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-breach-record]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'breach' },
  template: `
    <div class="breach__head">
      @switch (headingLevel()) {
        @case (3) {
          <h3 class="breach__title">{{ title() }}</h3>
        }
        @case (4) {
          <h4 class="breach__title">{{ title() }}</h4>
        }
        @default {
          <h2 class="breach__title">{{ title() }}</h2>
        }
      }
      <p class="breach__when">{{ when() }}</p>
    </div>
    <ng-content />
  `,
})
export class BreachRecord {
  readonly title = input.required<string>();
  readonly headingLevel = input<2 | 3 | 4>(2);
  readonly when = input.required<string>();
}

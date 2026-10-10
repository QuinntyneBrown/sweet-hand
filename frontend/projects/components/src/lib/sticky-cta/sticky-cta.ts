import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The bar that keeps "Send an enquiry" in view below 62rem
 * (docs/specs/components/sticky-cta.md). The host is the `div.sticky-cta`
 * itself; the button arrives through the default slot.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div[sh-sticky-cta]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sticky-cta', role: 'region', '[attr.aria-label]': 'regionLabel()' },
  template: `
    <div class="sticky-cta__text">
      <strong>{{ heading() }}</strong>
      @if (detail()) {
        <span>{{ detail() }}</span>
      }
    </div>
    <ng-content />
  `,
})
export class StickyCta {
  readonly regionLabel = input.required<string>();
  readonly heading = input.required<string>();
  readonly detail = input<string | null>(null);
}

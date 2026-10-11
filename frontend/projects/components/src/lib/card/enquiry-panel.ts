import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The caterer page's side column at LG and XL (card CRD, `sh-enquiry-panel`). */
@Component({
  selector: 'sh-enquiry-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (skeleton()) {
      <aside class="enquiry-panel only-lg" aria-hidden="true">
        <span class="skeleton skeleton--text"></span>
        <span class="skeleton skeleton--text"></span>
        <span class="skeleton skeleton--text"></span>
        <span class="skeleton skeleton--rect"></span>
      </aside>
    } @else {
      <aside class="enquiry-panel only-lg" [attr.aria-label]="label()">
        <ng-content />
        <ng-content select="[slot=action]" />
        @if (note()) {
          <p class="enquiry-panel__note">{{ note() }}</p>
        }
      </aside>
    }
  `,
})
export class EnquiryPanel {
  readonly label = input.required<string>();
  readonly note = input<string | null>(null);
  readonly skeleton = input(false);
}

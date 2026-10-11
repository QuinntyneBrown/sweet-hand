import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The caterer page's side column at LG and XL (card CRD, `sh-enquiry-panel`). */
@Component({
  selector: 'sh-enquiry-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './enquiry-panel.html',
})
export class EnquiryPanel {
  readonly label = input.required<string>();
  readonly note = input<string | null>(null);
  readonly skeleton = input(false);
}

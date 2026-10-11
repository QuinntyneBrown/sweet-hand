import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The sunken line that ends a closed thread (card CRD, `sh-closed-note`). */
@Component({
  selector: 'sh-closed-note',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<p class="closed-note">{{ text() }}</p>`,
})
export class ClosedNote {
  readonly text = input.required<string>();
}

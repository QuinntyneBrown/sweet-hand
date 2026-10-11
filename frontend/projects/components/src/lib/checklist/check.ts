import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from '../icon/icon';
import type { CheckStatus } from './check-status';

/**
 * The round check: an empty ring (to do), a filled disc with a tick (done) or
 * a danger ring with an exclamation (docs/specs/components/checklist.md,
 * `sh-check`). Always hidden from assistive technology: the words carry the state.
 */
@Component({
  selector: 'sh-check',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @switch (status()) {
      @case ('done') {
        <span class="check check--done" aria-hidden="true"><svg shIcon="check"></svg></span>
      }
      @case ('attention') {
        <span class="check check--error" aria-hidden="true"><svg shIcon="exclamation"></svg></span>
      }
      @default {
        <span class="check" aria-hidden="true"></span>
      }
    }
  `,
})
export class Check {
  readonly status = input.required<CheckStatus>();
}

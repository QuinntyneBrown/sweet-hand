import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The region's hidden status line: what is loading, then what loaded (D-6). */
@Component({
  selector: 'sh-loading-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<p class="visually-hidden" role="status">{{ loading() ? loadingLabel() : (doneLabel() ?? '') }}</p>`,
})
export class LoadingStatus {
  readonly loading = input(false);
  readonly loadingLabel = input.required<string>();
  readonly doneLabel = input<string | null>(null);
}

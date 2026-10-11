import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * "Saved", "Saving…", "Not saved: fix 2 things below" (form-layout CRD,
 * `sh-save-status`). In the page intro it is a polite status; inline after a
 * submit button it is plain text.
 */
@Component({
  selector: 'sh-save-status',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './save-status.html',
})
export class SaveStatus {
  readonly state = input<'saved' | 'saving' | 'error'>('saved');
  readonly text = input.required<string>();
  readonly inline = input(false);

  protected readonly cls = computed(() => ['save-status', this.state() === 'saved' && 'save-status--saved', this.state() === 'error' && 'save-status--error'].filter(Boolean).join(' '));
}

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
  template: `
    @if (inline()) {
      <span [class]="cls()">@switch (state()) {
          @case ('saving') {
            <span class="dot dot--pulse" aria-hidden="true"></span>
          }
          @case ('error') {
            <svg class="icon--sm" shIcon="danger"></svg>
          }
          @default {
            <svg class="icon--sm" shIcon="success"></svg>
          }
        }{{ text() }}</span
      >
    } @else {
      <p [class]="cls()" role="status">@switch (state()) {
          @case ('saving') {
            <span class="dot dot--pulse" aria-hidden="true"></span>
          }
          @case ('error') {
            <svg class="icon--sm" shIcon="danger"></svg>
          }
          @default {
            <svg class="icon--sm" shIcon="success"></svg>
          }
        }{{ text() }}</p>
    }
  `,
})
export class SaveStatus {
  readonly state = input<'saved' | 'saving' | 'error'>('saved');
  readonly text = input.required<string>();
  readonly inline = input(false);

  protected readonly cls = computed(() => ['save-status', this.state() === 'saved' && 'save-status--saved', this.state() === 'error' && 'save-status--error'].filter(Boolean).join(' '));
}

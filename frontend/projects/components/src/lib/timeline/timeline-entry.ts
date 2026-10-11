import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Timeline } from './timeline';
import type { TimelineForm } from './timeline-form';

/** One entry of a timeline (timeline CRD, `sh-timeline-entry`), used as `<li sh-timeline-entry>`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-timeline-entry]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (form()) {
      @case ('steps') {
        <strong>{{ event() }}</strong><span class="text-muted">{{ detail() }}</span>
      }
      @case ('sentence') {
        <time class="timeline__when" [attr.datetime]="datetime()">{{ when() }}</time><span>{{ event() }}</span>
        @if (reason()) {
          <span class="text-muted text-sm">{{ quotedReason() }}</span>
        }
      }
      @default {
        <time class="timeline__when" [attr.datetime]="datetime()">{{ when() }}</time
        ><span
          ><strong>{{ event() }}</strong
          >@if (actor()) {&ngsp;· {{ actor() }}}</span
        >
        @if (reason()) {
          <span class="text-muted text-sm">{{ quotedReason() }}</span>
        }
      }
    }
  `,
})
export class TimelineEntry {
  private readonly timeline = inject(Timeline, { optional: true });

  readonly datetime = input<string | null>(null);
  readonly when = input<string | null>(null);
  readonly event = input.required<string>();
  readonly actor = input<string | null>(null);
  readonly reason = input<string | null>(null);
  readonly quoted = input(false);
  readonly detail = input<string | null>(null);

  protected readonly form = computed<TimelineForm>(() => this.timeline?.form() ?? 'event');
  protected readonly quotedReason = computed(() => (this.quoted() ? `“${this.reason()}”` : this.reason()));
}

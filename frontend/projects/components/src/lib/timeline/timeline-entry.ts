import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Timeline } from './timeline';
import type { TimelineForm } from './timeline-form';

/** One entry of a timeline (timeline CRD, `sh-timeline-entry`), used as `<li sh-timeline-entry>`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-timeline-entry]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timeline-entry.html',
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

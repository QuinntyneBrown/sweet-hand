import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

type TimelineForm = 'event' | 'sentence' | 'steps';

/**
 * An ordered list of what happened or what happens next
 * (docs/specs/components/timeline.md, `sh-timeline`). One entry form per list.
 */
@Component({
  selector: 'sh-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (busy()) {
      <p class="visually-hidden" role="status">{{ busyLabel() }}</p>
      <div class="timeline" aria-hidden="true">
        @for (i of skeletons(); track i) {
          <div><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></div>
        }
      </div>
    } @else {
      <ol class="timeline" [attr.aria-label]="label()"><ng-content /></ol>
    }
  `,
})
export class Timeline {
  readonly label = input.required<string>();
  readonly form = input<TimelineForm>('event');
  readonly busy = input(false);
  readonly busyLabel = input('');
  readonly skeletonCount = input(2);

  protected readonly skeletons = computed(() => Array.from({ length: Math.max(1, this.skeletonCount()) }, (_, i) => i));
}

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

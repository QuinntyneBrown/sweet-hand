import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

let nextId = 0;

/**
 * A bar for how much of a task is done (docs/specs/components/progress.md,
 * `sh-progress`). `value` null is the indeterminate bar. Never interactive.
 */
@Component({
  selector: 'sh-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (value() === null) {
      <div class="progress progress--indeterminate" role="progressbar" [attr.aria-label]="labelledBy() ? null : label()" [attr.aria-labelledby]="labelledBy()" aria-busy="true">
        <div class="progress__bar"></div>
      </div>
    } @else {
      <div
        [class]="cls()"
        role="progressbar"
        [attr.aria-label]="labelledBy() ? null : label()"
        [attr.aria-labelledby]="labelledBy()"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuemax]="max()"
        [attr.aria-valuenow]="clamped()"
        [attr.aria-valuetext]="valueText()"
      >
        <div class="progress__bar" [style.--value]="percent()"></div>
      </div>
    }
  `,
})
export class Progress {
  readonly value = input<number | null>(null);
  readonly min = input(0);
  readonly max = input(100);
  readonly valueText = input<string | null>(null);
  readonly label = input<string | null>(null);
  readonly labelledBy = input<string | null>(null);
  readonly tone = input<'default' | 'success' | 'danger'>('default');

  protected readonly clamped = computed(() => Math.min(this.max(), Math.max(this.min(), this.value() ?? this.min())));
  protected readonly percent = computed(() => `${((this.clamped() - this.min()) / (this.max() - this.min())) * 100}%`);
  protected readonly cls = computed(() => ['progress', this.tone() !== 'default' && `progress--${this.tone()}`].filter(Boolean).join(' '));
}

/** "Ready to submit · 8 of 10 done": a count of items done (progress CRD, `sh-meter`). */
@Component({
  selector: 'sh-meter',
  imports: [Progress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div class="meter">
      <div class="meter__label"><span [id]="labelId">{{ label() }}</span><span>{{ valueText() }}</span></div>
      <sh-progress [value]="value()" [max]="max()" [valueText]="valueText()" [labelledBy]="labelId" />
    </div>
  `,
})
export class Meter {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly max = input.required<number>();
  readonly valueText = input.required<string>();

  protected readonly labelId = `sh-meter-label-${++nextId}`;
}

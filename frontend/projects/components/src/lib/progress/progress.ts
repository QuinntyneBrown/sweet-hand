import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';


/**
 * A bar for how much of a task is done (docs/specs/components/progress.md,
 * `sh-progress`). `value` null is the indeterminate bar. Never interactive.
 */
@Component({
  selector: 'sh-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './progress.html',
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


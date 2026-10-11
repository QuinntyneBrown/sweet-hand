import { ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID } from '@angular/core';
import { Icon } from '../icon/icon';

/** One decimal, rounded half away from zero, in the page locale: 4.7, 3.0 (rating CRD D-3). */
export function formatAverage(average: number, locale: string): string {
  const rounded = Math.sign(average) * Math.round(Math.abs(average) * 10 + 1e-9) / 10;
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(rounded);
}

/**
 * The average and count of a caterer's reviews (docs/specs/components/rating.md,
 * `sh-rating-summary`): "4.7 · 23 reviews". Renders nothing for 0 reviews (D-4).
 */
@Component({
  selector: 'sh-rating-summary',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (count() > 0) {
      @if (variant() === 'inline') {
        <span class="visually-hidden">{{ ratedPrefix() }} </span>{{ text() }}
      } @else {
        <span class="rating"><span class="stars" aria-hidden="true"><svg shIcon="star"></svg></span><span class="rating__summary">{{ text() }}</span></span>
      }
    }
  `,
})
export class RatingSummary {
  readonly variant = input<'head' | 'inline'>('head');
  readonly average = input.required<number>();
  readonly count = input.required<number>();
  readonly countLabel = input.required<string>();
  readonly ratedPrefix = input<string | null>(null);

  private readonly locale = inject(LOCALE_ID);
  protected readonly text = computed(() => `${formatAverage(this.average(), this.locale)} · ${this.countLabel()}`);
}


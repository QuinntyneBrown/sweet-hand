import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject, input, model, signal } from '@angular/core';
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

type StarValue = 1 | 2 | 3 | 4 | 5;

/**
 * The five-star rating input (rating CRD, `sh-star-input`): a native radio
 * group, so arrow keys and screen readers work as for any radios.
 */
@Component({
  selector: 'sh-star-input',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <fieldset [disabled]="disabled()">
      <legend>{{ legend() }}</legend>
      <div class="star-input" (pointerleave)="hover.set(null)">
        @for (n of stars; track n) {
          <input
            type="radio"
            [attr.name]="name()"
            [id]="idPrefix() + '-' + n"
            [value]="n"
            [checked]="value() === n"
            [attr.aria-invalid]="error() ? 'true' : null"
            [attr.aria-describedby]="error() ? idPrefix() + '-error' : null"
            [attr.autofocus]="autofocus() && n === (value() ?? 1) ? '' : null"
            (change)="choose(n)"
          /><label [for]="idPrefix() + '-' + n" [attr.data-filled]="n <= (hover() ?? value() ?? 0) ? '' : null" (pointerenter)="disabled() ? null : hover.set(n)"
            ><span class="visually-hidden">{{ starLabels()[n - 1] }}</span><svg shIcon="star"></svg
          ></label>
        }
      </div>
      @if (error()) {
        <span class="field__error" [id]="idPrefix() + '-error'">{{ error() }}</span>
      }
    </fieldset>
  `,
})
export class StarInput {
  readonly value = model<StarValue | null>(null);
  readonly name = input('rating');
  readonly idPrefix = input('star');
  readonly legend = input.required<string>();
  readonly starLabels = input.required<readonly [string, string, string, string, string]>();
  readonly error = input<string | null>(null);
  readonly disabled = input(false);
  readonly autofocus = input(false);

  protected readonly stars: StarValue[] = [1, 2, 3, 4, 5];
  /** The hover preview fills stars up to the pointer; it never changes the value (CRD, Hover state). */
  protected readonly hover = signal<StarValue | null>(null);

  protected choose(n: StarValue): void {
    if (this.disabled()) return;
    this.value.set(n);
  }
}

/** One review's score as five stars, read as "4 out of 5" (rating CRD, `sh-stars`). */
@Component({
  selector: 'sh-stars',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (valid()) {
      <span class="stars" role="img" [attr.aria-label]="label()">
        @for (i of five; track i) {
          <svg shIcon="star" [class.icon--empty]="i >= value()"></svg>
        }
      </span>
    }
  `,
})
export class Stars {
  readonly value = input.required<number>();
  readonly label = input.required<string>();

  protected readonly five = [0, 1, 2, 3, 4];
  /** Only whole stars from 1 to 5 exist (D-5). */
  protected readonly valid = computed(() => Number.isInteger(this.value()) && this.value() >= 1 && this.value() <= 5);
}

import { ChangeDetectionStrategy, Component, input, model, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import type { StarValue } from './star-value';

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

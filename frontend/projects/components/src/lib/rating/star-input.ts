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
  templateUrl: './star-input.html',
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

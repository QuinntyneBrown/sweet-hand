import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';

/** One review's score as five stars, read as "4 out of 5" (rating CRD, `sh-stars`). */
@Component({
  selector: 'sh-stars',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './stars.html',
})
export class Stars {
  readonly value = input.required<number>();
  readonly label = input.required<string>();

  protected readonly five = [0, 1, 2, 3, 4];
  /** Only whole stars from 1 to 5 exist (D-5). */
  protected readonly valid = computed(() => Number.isInteger(this.value()) && this.value() >= 1 && this.value() <= 5);
}

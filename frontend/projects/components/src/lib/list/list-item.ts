import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';

/**
 * A title-and-meta row with an optional trailing button or status
 * (list CRD, `sh-list-item`). Used as an attribute on the `li`.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-list-item]',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.list__item]': '!href()' },
  templateUrl: './list-item.html',
})
export class ListItem {
  readonly title = input.required<string>();
  readonly meta = input<string | null>(null);
  readonly href = input<string | null>(null);
  readonly current = input(false);
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** `ul.inline-list`: commas between items come from CSS. */
@Component({
  selector: 'sh-inline-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './inline-list.html',
})
export class InlineList {
  readonly items = input.required<readonly string[]>();
}

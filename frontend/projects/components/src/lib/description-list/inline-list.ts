import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** `ul.inline-list`: commas between items come from CSS. */
@Component({
  selector: 'sh-inline-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<ul class="inline-list">@for (item of items(); track $index) {<li>{{ item }}</li>}</ul>`,
})
export class InlineList {
  readonly items = input.required<readonly string[]>();
}

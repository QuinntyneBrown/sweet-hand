import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/** An old or new value in a change review: `del.diff-old` or `ins.diff-new`. */
@Component({
  selector: 'sh-change-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [NgTemplateOutlet],
  templateUrl: './change-value.html',
})
export class ChangeValue {
  readonly kind = input.required<'old' | 'new'>();
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/** An old or new value in a change review: `del.diff-old` or `ins.diff-new`. */
@Component({
  selector: 'sh-change-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [NgTemplateOutlet],
  template: `@if (kind() === 'old') {<del class="diff-old"><ng-container *ngTemplateOutlet="text" /></del>} @else {<ins class="diff-new"><ng-container *ngTemplateOutlet="text" /></ins>}
    <ng-template #text><ng-content /></ng-template>`,
})
export class ChangeValue {
  readonly kind = input.required<'old' | 'new'>();
}

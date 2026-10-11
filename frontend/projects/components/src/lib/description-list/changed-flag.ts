import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon } from '../icon/icon';

/** "Changed since changes were requested" (`span.changed-flag`). */
@Component({
  selector: 'sh-changed-flag',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<span class="changed-flag">@if (icon()) {<svg class="icon--sm" shIcon="info"></svg>}<ng-content /></span>`,
})
export class ChangedFlag {
  readonly icon = input(false);
}

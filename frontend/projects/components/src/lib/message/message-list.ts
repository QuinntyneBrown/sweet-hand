import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The ordered messages of a thread (`sh-message-list`). */
@Component({
  selector: 'sh-message-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<ol class="messages" [attr.aria-label]="label()"><ng-content /></ol>`,
})
export class MessageList {
  readonly label = input.required<string>();
}

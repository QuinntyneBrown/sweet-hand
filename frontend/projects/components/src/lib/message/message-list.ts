import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The ordered messages of a thread (`sh-message-list`). */
@Component({
  selector: 'sh-message-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './message-list.html',
})
export class MessageList {
  readonly label = input.required<string>();
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The empty thread column beside the inbox on large screens (docs/specs/components/message.md). */
@Component({
  selector: 'sh-thread-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './thread-placeholder.html',
})
export class ThreadPlaceholder {
  readonly photos = input.required<readonly { src: string; size: 72 | 104 }[]>();
  readonly text = input.required<string>();
}

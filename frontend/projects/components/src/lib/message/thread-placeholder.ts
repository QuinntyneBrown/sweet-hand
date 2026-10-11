import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The empty thread column beside the inbox on large screens (docs/specs/components/message.md). */
@Component({
  selector: 'sh-thread-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div class="thread-placeholder">
      <div class="photo-row" aria-hidden="true">
        @for (p of photos(); track $index) {
          <span class="photo"><img [src]="p.src" alt="" [width]="p.size" [height]="p.size" /></span>
        }
      </div>
      <p>{{ text() }}</p>
    </div>
  `,
})
export class ThreadPlaceholder {
  readonly photos = input.required<readonly { src: string; size: 72 | 104 }[]>();
  readonly text = input.required<string>();
}

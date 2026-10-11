import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';

/** A dish in the menu manager with move, edit and remove (list CRD, `sh-edit-row`). Used as an attribute on the `li`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-edit-row]',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'edit-row' },
  templateUrl: './edit-row.html',
})
export class EditRow {
  readonly name = input.required<string>();
  readonly first = input(false);
  readonly last = input(false);
  readonly readOnly = input(false);
  readonly moveUpLabel = input<string>('');
  readonly moveDownLabel = input<string>('');
  readonly editLabel = input<string>('');
  readonly removeLabel = input<string>('');

  readonly movedUp = output<void>();
  readonly movedDown = output<void>();
  readonly editRequested = output<void>();
  readonly removeRequested = output<void>();

  private readonly up = viewChild<ElementRef<HTMLButtonElement>>('up');
  private readonly down = viewChild<ElementRef<HTMLButtonElement>>('down');

  focusMove(direction: 'up' | 'down'): void {
    (direction === 'up' ? this.up() : this.down())?.nativeElement.focus();
  }
}

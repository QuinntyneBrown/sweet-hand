import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';
import { Progress } from '../progress/progress';
import type { PhotoTileLabels } from './photo-tile-labels';
import type { TilePhoto } from './tile-photo';

/**
 * One photo in the caterer's photo manager (docs/specs/components/photo-tile.md,
 * `sh-photo-tile`), used as `<li sh-photo-tile>` so the list keeps `li`
 * children. Reordering is by Move up and Move down only (L2-042.1).
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-photo-tile]',
  imports: [Icon, Progress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'photo-tile' },
  templateUrl: './photo-tile.html',
})
export class PhotoTile {
  readonly mode = input<'editable' | 'readonly' | 'uploading' | 'processing'>('editable');
  readonly position = input.required<number>();
  readonly total = input.required<number>();
  readonly photo = input<TilePhoto | null>(null);
  readonly caption = input<string | null>(null);
  readonly fileName = input('');
  readonly progress = input(0);
  readonly labels = input.required<PhotoTileLabels>();

  readonly moveRequested = output<{ position: number; direction: 'up' | 'down' }>();
  readonly editRequested = output<{ position: number }>();
  readonly cancelRequested = output<{ fileName: string }>();

  private readonly up = viewChild<ElementRef<HTMLButtonElement>>('up');
  private readonly down = viewChild<ElementRef<HTMLButtonElement>>('down');
  private readonly edit = viewChild<ElementRef<HTMLButtonElement>>('edit');

  protected readonly fill = (text: string): string =>
    text.replace('{n}', String(this.position())).replace('{file}', this.fileName()).replace('{pct}', String(this.progress()));

  protected move(direction: 'up' | 'down'): void {
    if (direction === 'up' && this.position() === 1) return;
    if (direction === 'down' && this.position() === this.total()) return;
    this.moveRequested.emit({ position: this.position(), direction });
  }

  /** Focus after a move follows the photo to its new tile (photo-tile CRD, implementation notes). */
  focusMove(direction: 'up' | 'down'): void {
    (direction === 'up' ? this.up() : this.down())?.nativeElement.focus();
  }

  focusEdit(): void {
    this.edit()?.nativeElement.focus();
  }
}


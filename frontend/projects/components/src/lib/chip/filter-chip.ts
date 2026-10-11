import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, inject, input, output, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';
import { ChipGroup } from './chip-group';

/** An active filter with its remove button (`span.chip.chip--filter`). */
@Component({
  selector: 'sh-filter-chip',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './filter-chip.html',
})
export class FilterChip {
  readonly removeLabel = input.required<string>();
  readonly removeDisabled = input(false);
  readonly removed = output<void>();

  private readonly group = inject(forwardRef(() => ChipGroup), { optional: true });
  private readonly removeButton = viewChild.required<ElementRef<HTMLButtonElement>>('remove');

  focusRemove(): void {
    this.removeButton().nativeElement.focus();
  }

  protected onRemove(): void {
    this.group?.noteRemoval(this);
    this.removed.emit();
  }
}

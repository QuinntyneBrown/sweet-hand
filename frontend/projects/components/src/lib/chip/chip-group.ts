import { afterNextRender, ChangeDetectionStrategy, Component, computed, contentChildren, effect, ElementRef, inject, Injector, input, output, untracked, viewChild } from '@angular/core';
import { FilterChip } from './filter-chip';
import { Chip } from './chip';

/**
 * A labelled row of chips (`div.active-filters[role=group]`). After a filter
 * chip is removed, focus goes to the next chip, then to "Clear filters", and
 * otherwise `emptied` asks the page to move it (D-6). Renders nothing without chips.
 */
@Component({
  selector: 'sh-chip-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (filled()) {
      <div #row class="active-filters" role="group" [attr.aria-label]="label()">
        <ng-content />
      </div>
    }
  `,
})
export class ChipGroup {
  readonly label = input.required<string>();
  // The CRD names this output; it never fires as the media "emptied" event.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly emptied = output<void>();

  private readonly filterChips = contentChildren(FilterChip, { descendants: true });
  private readonly chips = contentChildren(Chip, { descendants: true });
  protected readonly filled = computed(() => this.filterChips().length + this.chips().length > 0);
  private readonly row = viewChild<ElementRef<HTMLElement>>('row');
  private readonly injector = inject(Injector);
  private removedAt: number | null = null;

  constructor() {
    effect(() => {
      const chips = this.filterChips();
      untracked(() => {
        const index = this.removedAt;
        if (index === null) return;
        this.removedAt = null;
        afterNextRender(() => this.moveFocus(chips, index), { injector: this.injector });
      });
    });
  }

  noteRemoval(chip: FilterChip): void {
    this.removedAt = this.filterChips().indexOf(chip);
  }

  private moveFocus(chips: readonly FilterChip[], index: number): void {
    if (chips[index]) return chips[index].focusRemove();
    const clear = this.row()?.nativeElement.querySelector<HTMLElement>('a[href]');
    if (clear) return clear.focus();
    if (chips.length) return chips[chips.length - 1].focusRemove();
    this.emptied.emit();
  }
}

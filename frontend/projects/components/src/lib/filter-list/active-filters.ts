import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonAnchor } from '../button/button-anchor';
import { ChipGroup } from '../chip/chip-group';
import { FilterChip } from '../chip/filter-chip';

/**
 * The chips row above the results: one removable chip per active filter, then
 * "Clear filters" (filter-list CRD, `sh-active-filters`). Nothing renders
 * without chips; `emptied` fires when the last chip was removed (chip D-6).
 */
@Component({
  selector: 'sh-active-filters',
  imports: [ChipGroup, FilterChip, ButtonAnchor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './active-filters.html',
})
export class ActiveFilters {
  readonly label = input.required<string>();
  readonly chips = input.required<{ value: string; label: string }[]>();
  readonly removeLabel = input.required<(label: string) => string>();
  /** "Clear filters"; null for rows that only list choices (the sheet's "Selected areas"). */
  readonly clearLabel = input<string | null>(null);
  readonly clearHref = input<string | null>(null);
  readonly disabled = input(false);

  readonly removed = output<string>();
  // Named as on `sh-chip-group` (chip CRD); it never fires as the media "emptied" event.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly emptied = output<void>();
}

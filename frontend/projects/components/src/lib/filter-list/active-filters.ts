import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonAnchor } from '../button/button';
import { ChipGroup, FilterChip } from '../chip/chip';

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
  template: `
    <sh-chip-group [label]="label()" (emptied)="emptied.emit()">
      @for (chip of chips(); track chip.value) {
        <sh-filter-chip [removeLabel]="removeLabel()(chip.label)" [removeDisabled]="disabled()" (removed)="removed.emit(chip.value)">{{ chip.label }}</sh-filter-chip>
      }
      @if (chips().length && clearLabel() && clearHref()) {
        <sh-button-anchor variant="link" size="sm" [href]="clearHref()!" [disabled]="disabled()">{{ clearLabel() }}</sh-button-anchor>
      }
    </sh-chip-group>
  `,
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

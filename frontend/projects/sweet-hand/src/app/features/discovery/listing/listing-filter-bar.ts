import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Checkbox, FilterDropdown, FilterTrigger, optionDisabled, type FilterOption } from '@sweet-hand/components';
import { AreaField } from '../search/area-field';
import { caterersCount } from './listing-text';
import { type ServiceArea } from '@sweet-hand/api';
import type { Group } from './group';

/**
 * The tablet filter bar (MD): Cuisine and Area dropdowns that apply each tick
 * at once and show the live total (docs/mocks/dialogs/filter-menu, L2-009.2).
 */
@Component({
  selector: 'app-listing-filter-bar',
  imports: [AreaField, Checkbox, FilterDropdown, FilterTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './listing-filter-bar.html',
})
export class ListingFilterBar {
  readonly cuisines = input.required<FilterOption[]>();
  readonly areas = input.required<FilterOption[]>();
  readonly serviceAreas = input.required<readonly ServiceArea[]>();
  readonly total = input<number | null>(null);
  readonly disabled = input(false);

  readonly cuisineToggled = output<{ value: string; pressed: boolean }>();
  readonly areaToggled = output<{ value: string; pressed: boolean }>();
  readonly areaChosen = output<string>();
  readonly cuisinesCleared = output<void>();
  readonly areasCleared = output<void>();

  protected readonly open = signal<Group | null>(null);
  protected readonly cuisineCount = computed(() => this.cuisines().filter((o) => o.pressed).length);
  protected readonly areaCount = computed(() => this.areas().filter((o) => o.pressed).length);
  protected readonly totalText = computed(() => (this.total() === null ? '' : caterersCount(this.total()!)));

  protected toggle(group: Group): void {
    this.open.update((current) => (current === group ? null : group));
  }

  protected isDisabled(o: FilterOption): boolean {
    return optionDisabled(o, this.disabled());
  }

  protected countText(o: FilterOption): string | null {
    return o.count === null ? null : caterersCount(o.count);
  }
}

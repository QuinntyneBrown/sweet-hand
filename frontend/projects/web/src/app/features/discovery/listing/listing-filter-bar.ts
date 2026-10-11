import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Checkbox, FilterDropdown, FilterTrigger, optionDisabled, type FilterOption } from '@sweet-hand/components';
import type { ServiceArea } from '../../../core/api/discovery.models';
import { AreaField } from '../search/area-field';
import { caterersCount } from './listing-text';

type Group = 'cuisine' | 'area';

/**
 * The tablet filter bar (MD): Cuisine and Area dropdowns that apply each tick
 * at once and show the live total (docs/mocks/dialogs/filter-menu, L2-009.2).
 */
@Component({
  selector: 'app-listing-filter-bar',
  imports: [AreaField, Checkbox, FilterDropdown, FilterTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div class="filter-bar only-md">
      <sh-filter-dropdown
        [open]="open() === 'cuisine'"
        panelId="menu-cuisine"
        title="Cuisine"
        i18n-title="@@filters.cuisine"
        [resultCount]="totalText()"
        clearLabel="Clear"
        i18n-clearLabel="@@filters.clearGroup"
        [clearDisabled]="!cuisineCount()"
        (cleared)="cuisinesCleared.emit()"
        (closed)="open.set(null)"
      >
        <sh-filter-trigger
          slot="trigger"
          label="Cuisine"
          i18n-label="@@filters.cuisine"
          controls="menu-cuisine"
          [expanded]="open() === 'cuisine'"
          [count]="cuisineCount()"
          countLabel="selected"
          i18n-countLabel="@@filters.selected"
          [disabled]="disabled()"
          (activated)="toggle('cuisine')"
        />
        <fieldset class="filter-group">
          <legend class="visually-hidden" i18n="@@filters.cuisines">Cuisines</legend>
          @for (o of cuisines(); track o.value) {
            <sh-checkbox name="cuisine" [value]="o.value" [checked]="o.pressed" [disabled]="isDisabled(o)" [description]="countText(o)" (checkedChange)="cuisineToggled.emit({ value: o.value, pressed: $event })">{{
              o.label
            }}</sh-checkbox>
          }
        </fieldset>
      </sh-filter-dropdown>

      <sh-filter-dropdown
        [open]="open() === 'area'"
        panelId="menu-area"
        title="Area"
        i18n-title="@@filters.area"
        [resultCount]="totalText()"
        clearLabel="Clear"
        i18n-clearLabel="@@filters.clearGroup"
        [clearDisabled]="!areaCount()"
        (cleared)="areasCleared.emit()"
        (closed)="open.set(null)"
      >
        <sh-filter-trigger
          slot="trigger"
          label="Area"
          i18n-label="@@filters.area"
          controls="menu-area"
          [expanded]="open() === 'area'"
          [count]="areaCount()"
          countLabel="selected"
          i18n-countLabel="@@filters.selected"
          [disabled]="disabled()"
          (activated)="toggle('area')"
        />
        <div class="filter-group">
          <app-area-field [areas]="serviceAreas()" (areaChosen)="areaChosen.emit($event)" />
          <fieldset class="filter-group">
            <legend class="visually-hidden" i18n="@@filters.regions">Regions</legend>
            @for (o of areas(); track o.value) {
              <sh-checkbox name="region" [value]="o.value" [checked]="o.pressed" [disabled]="isDisabled(o)" [description]="countText(o)" (checkedChange)="areaToggled.emit({ value: o.value, pressed: $event })">{{
                o.label
              }}</sh-checkbox>
            }
          </fieldset>
        </div>
      </sh-filter-dropdown>
    </div>
  `,
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

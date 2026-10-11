import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, output, signal, untracked } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActiveFilters, Button, Checkbox, Sheet, delayedBusy, optionDisabled, type FilterOption } from '@sweet-hand/components';
import { AreaField } from '../search/area-field';
import { activeChips, areaOptions, cuisineOptions, removeFilterLabel } from './listing-filters';
import { activeFilterCount, sameFilters, withArea, withCuisine, withRegion } from './listing-query';
import { caterersCount } from './listing-text';
import { DiscoveryService, type ListingPageView, type ListingQuery, type ServiceArea } from '@sweet-hand/api';

/**
 * The phone Filters sheet (docs/mocks/dialogs/filters): choices wait in the
 * sheet, each change counts the result, and the primary applies them with that
 * number ("Show 2 caterers", L2-009.1). Close and Escape discard them.
 */
@Component({
  selector: 'app-listing-filters-sheet',
  imports: [ActiveFilters, AreaField, Button, Checkbox, Sheet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './listing-filters-sheet.html',
})
export class ListingFiltersSheet {
  readonly open = input(false);
  /** The filters in force, which the sheet starts from. */
  readonly current = input.required<ListingQuery>();
  /** The results in force, so the sheet shows counts before its first recount. */
  readonly currentView = input<ListingPageView | undefined>(undefined);
  readonly serviceAreas = input.required<readonly ServiceArea[]>();
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly applied = output<ListingQuery>();
  readonly dismissed = output<void>();

  private readonly api = inject(DiscoveryService);
  protected readonly pending = signal<ListingQuery>({ cuisines: [], regions: [], areas: [], page: 1 });
  /** The choices are those in force, whose results the listing already shows. */
  private readonly unchanged = computed(() => sameFilters(this.pending(), this.current()) && !!this.currentView());
  /** Only changed choices are counted. */
  private readonly counted = rxResource({
    params: () => (this.open() && !this.unchanged() ? { ...this.pending(), page: 1 } : undefined),
    stream: ({ params }) => this.api.listing(params),
  });
  protected readonly busy = delayedBusy(this.counted.isLoading);
  /** The latest count; while the next one loads, the previous one; for the choices in force, the listing's results. */
  private readonly view = linkedSignal<{ v: ListingPageView | undefined; open: boolean; unchanged: boolean }, ListingPageView | undefined>({
    source: () => ({ v: this.counted.hasValue() ? this.counted.value() : undefined, open: this.open(), unchanged: this.unchanged() }),
    computation: (s, previous) => {
      if (s.unchanged) return this.currentView();
      return s.v ?? (previous?.source.open && s.open ? previous.value : this.currentView());
    },
  });

  protected readonly cuisines = computed(() => (this.view() ? cuisineOptions(this.view()!, this.pending()) : []));
  protected readonly regions = computed(() => (this.view() ? areaOptions(this.view()!, this.pending()).filter((o) => o.value.startsWith('region:')) : []));
  protected readonly areaChips = computed(() => (this.view() ? activeChips(this.view()!, this.pending()).filter((c) => c.value.startsWith('area:')) : []));
  protected readonly pendingCount = computed(() => activeFilterCount(this.pending()));
  protected readonly applyLabel = computed(() => {
    const total = this.view()?.total ?? 0;
    return total === 1 ? $localize`:@@filters.showOne:Show 1 caterer` : $localize`:@@filters.showMany:Show ${caterersCount(total)}:count:`;
  });
  protected readonly removeLabel = removeFilterLabel;

  constructor() {
    // Each opening starts from the filters in force.
    effect(() => {
      if (this.open()) untracked(() => this.pending.set({ ...this.current(), page: 1 }));
    });
  }

  protected isDisabled(o: FilterOption): boolean {
    return optionDisabled(o, false);
  }

  protected countText(o: FilterOption): string | null {
    return o.count === null ? null : caterersCount(o.count);
  }

  protected toggleCuisine(id: string, on: boolean): void {
    this.pending.update((q) => withCuisine(q, id, on));
  }

  protected toggleRegion(value: string, on: boolean): void {
    this.pending.update((q) => withRegion(q, value.split(':')[1], on));
  }

  protected addArea(id: string): void {
    this.pending.update((q) => withArea(q, id, true));
  }

  protected removeArea(value: string): void {
    this.pending.update((q) => withArea(q, value.split(':')[1], false));
  }

  protected clear(): void {
    this.pending.set({ cuisines: [], regions: [], areas: [], page: 1 });
  }

  protected apply(): void {
    if (this.busy()) return;
    this.applied.emit(this.pending());
  }
}

import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, linkedSignal, signal, untracked, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, of, throwError } from 'rxjs';
import {
  ActiveFilters,
  Button,
  ButtonAnchor,
  CatererCard,
  CatererGrid,
  EmptyState,
  FilterGroup,
  FilterTrigger,
  Icon,
  Pagination,
  Skeleton,
  delayedBusy,
} from '@sweet-hand/components';
import { count } from '../../../core/format/format';
import { problemOf, reference } from '../../../core/forms/problem';
import { AreaField } from '../search/area-field';
import { ListingFilterBar } from './listing-filter-bar';
import { ListingFiltersSheet } from './listing-filters-sheet';
import { SearchDialog } from '../search/search-dialog';
import {
  activeChips,
  areaOptions,
  caterersNoun,
  cuisineOptions,
  moreCuisines,
  noResultsText,
  parseAreaValue,
  removeFilterLabel,
  uncountedAreaOptions,
  uncountedCuisineOptions,
  withoutChip,
} from './listing-filters';
import { pageLabel, pageSummary, savedAt } from './listing-text';
import { Connectivity } from './connectivity';
import { ListingCache } from './listing-cache';
import { activeFilterCount, knownQuery, readListingQuery, toQueryParams, withArea, withCuisine, withRegion, withoutCuisines } from './listing-query';
import { DiscoveryService, type ListingPageView, type ListingQuery } from '@sweet-hand/api';

/** The caterer listing, /caterers (docs/detailed-designs/discovery/browse-listing). */
@Component({
  selector: 'app-listing-page',
  imports: [RouterLink, ActiveFilters, AreaField, ListingFilterBar, ListingFiltersSheet, SearchDialog, FilterTrigger, Button, ButtonAnchor, CatererCard, CatererGrid, EmptyState, FilterGroup, Icon, Pagination, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './listing.page.html',
})
export class ListingPage {
  private readonly api = inject(DiscoveryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });
  protected readonly query = computed(() => readListingQuery(this.params()));
  private readonly cache = inject(ListingCache);
  protected readonly online = inject(Connectivity).online;
  /** Each page that arrives is saved; without a connection a saved copy is shown instead (L2-091). */
  protected readonly listing = rxResource({
    params: () => this.query(),
    stream: ({ params }) =>
      this.api.listing(params).pipe(
        map((view) => this.cache.save(params, view)),
        catchError((error: unknown) => {
          const saved = this.cache.get(params);
          return problemOf(error).status === 0 && saved ? of({ ...saved, cached: true }) : throwError(() => error);
        }),
      ),
  });
  private readonly result = computed(() => (this.listing.hasValue() ? this.listing.value() : undefined));
  private readonly view = computed(() => this.result()?.view);
  /** Offline, the results say when they were saved: "60 caterers · saved Sat 10 Oct, 8:15 a.m.". */
  protected readonly savedText = computed(() => {
    const r = this.result();
    return !this.online() && r ? savedAt(r.savedAt) : null;
  });
  /** Offline, pages of these filters not seen in this visit cannot open. */
  protected readonly unavailablePages = computed(() => {
    const v = this.current();
    if (this.online() || !v) return [];
    return Array.from({ length: v.pageCount }, (_, i) => i + 1).filter((page) => page !== v.page && !this.cache.has({ ...this.known(), page }));
  });
  /** The last results that arrived, kept while the next ones load so the filters do not flash. */
  protected readonly shown = linkedSignal<ListingPageView | undefined, ListingPageView | undefined>({
    source: this.view,
    computation: (v, previous) => v ?? previous?.value,
  });
  private readonly failed = computed(() => this.listing.status() === 'error');
  /** Skeletons only once a load has taken 300 ms (skeleton D-3). */
  protected readonly busy = delayedBusy(this.listing.isLoading);
  /** What the results show: the new page, or the last one until the skeletons take over. */
  protected readonly current = computed(() => {
    if (this.failed() || this.busy()) return undefined;
    return this.view() ?? this.shown();
  });
  protected readonly failure = computed(() => {
    if (!this.failed()) return null;
    return { reference: reference(problemOf(this.listing.error()).problem) };
  });

  private readonly areaList = rxResource({ stream: () => this.api.serviceAreas() });
  protected readonly serviceAreas = computed(() => (this.areaList.hasValue() ? this.areaList.value() : []));
  private readonly cuisineList = rxResource({ stream: () => this.api.cuisines() });
  /** The URL's filters without values the listing does not know (L2-003.3). */
  protected readonly known = computed(() => knownQuery(this.query(), this.shown()));
  /** The occasion the listing is narrowed to, from /occasions (L2-021). */
  protected readonly occasion = computed(() => {
    const o = this.shown()?.occasions.find((x) => x.id === this.known().occasion);
    return o ? { name: o.name, lowerName: o.name.toLocaleLowerCase('en-CA') } : null;
  });
  protected readonly activeCount = computed(() => (this.shown() ? activeFilterCount(this.known()) : 0));
  /** Filters wait while there are no caterers yet, or no connection (empty and offline mocks). */
  protected readonly filtersDisabled = computed(() => this.firstRun() || !this.online());
  protected readonly sheetOpen = signal(false);
  protected readonly searchOpen = signal(false);
  protected readonly filtersTrigger = viewChild(FilterTrigger);
  protected readonly areaSearchButton = viewChild('areaButton', { read: Button });

  protected readonly cuisines = computed(() => {
    const v = this.shown();
    if (v) return cuisineOptions(v, this.query());
    return this.cuisineList.hasValue() ? uncountedCuisineOptions(this.cuisineList.value(), this.query()) : [];
  });
  protected readonly areas = computed(() => {
    const v = this.shown();
    return v ? areaOptions(v, this.query()) : uncountedAreaOptions(this.serviceAreas(), this.query());
  });
  protected readonly allCuisinesHref = computed(() => this.href(withoutCuisines(this.known())));
  protected readonly chips = computed(() => (this.shown() ? activeChips(this.shown()!, this.query()) : []));
  protected readonly removeFilterLabel = removeFilterLabel;
  /** No caterer is published at all yet: the first-run state, with every filter disabled. */
  protected readonly firstRun = computed(() => {
    const v = this.current();
    return !!v && v.total === 0 && activeChips(v, this.query()).length === 0;
  });
  protected readonly noResults = computed(() => {
    const v = this.current();
    return v && v.total === 0 && !this.firstRun() ? noResultsText(v, this.query()) : null;
  });
  protected readonly caterersNoun = caterersNoun;
  protected readonly moreCuisines = moreCuisines;

  protected readonly pageLabel = pageLabel;
  /** "1,284" (core/format). */
  protected readonly formatCount = count;
  protected readonly summary = computed(() => {
    const v = this.current();
    return v ? pageSummary(v.page, v.pageSize, v.total) : null;
  });
  protected readonly hrefFor = (page: number): string => this.href({ ...this.known(), page });

  private readonly resultsHeading = viewChild.required<ElementRef<HTMLElement>>('resultsHeading');
  private shownPage: number | null = null;

  constructor() {
    // After a page change, focus moves to the results (pagination D-7).
    effect(() => {
      const v = this.view();
      if (!v || this.listing.isLoading()) return;
      if (this.shownPage !== null && this.shownPage !== v.page) this.resultsHeading().nativeElement.focus();
      this.shownPage = v.page;
    });
    // Back online, a saved copy is replaced by fresh results.
    effect(() => {
      if (this.online() && untracked(() => this.cachedResult())) untracked(() => this.listing.reload());
    });
  }

  private cachedResult(): boolean {
    const r = this.result();
    return !!r && 'cached' in r && r.cached === true;
  }

  protected toggleCuisine(e: { value: string; pressed: boolean }): void {
    this.go(withCuisine(this.known(), e.value, e.pressed));
  }

  protected toggleArea(e: { value: string; pressed: boolean }): void {
    const { kind, id } = parseAreaValue(e.value);
    this.go(kind === 'region' ? withRegion(this.known(), id, e.pressed) : withArea(this.known(), id, e.pressed));
  }

  protected addArea(id: string): void {
    this.go(withArea(this.known(), id, true));
  }

  protected applySheet(q: ListingQuery): void {
    this.sheetOpen.set(false);
    this.go(q);
  }

  protected clearCuisines(): void {
    this.go(withoutCuisines(this.known()));
  }

  protected clearAreas(): void {
    this.go({ ...this.known(), regions: [], areas: [], page: 1 });
  }

  protected removeChip(value: string): void {
    this.go(withoutChip(this.known(), value));
  }

  protected focusResults(): void {
    this.resultsHeading().nativeElement.focus();
  }

  protected retry(): void {
    this.listing.reload();
  }

  private go(q: ListingQuery): void {
    void this.router.navigate(['/caterers'], { queryParams: toQueryParams(q) });
  }

  private href(q: ListingQuery): string {
    return this.router.serializeUrl(this.router.createUrlTree(['/caterers'], { queryParams: toQueryParams(q) }));
  }
}

import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, linkedSignal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveFilters, ButtonAnchor, CatererCard, CatererGrid, EmptyState, FilterGroup, Icon, Pagination } from '@sweet-hand/components';
import { DiscoveryApi } from '../../../core/api/discovery-api';
import type { ListingPageView, ListingQuery } from '../../../core/api/discovery.models';
import {
  activeChips,
  areaOptions,
  caterersNoun,
  cuisineOptions,
  moreCuisines,
  noResultsText,
  parseAreaValue,
  removeFilterLabel,
  withoutChip,
} from './listing-filters';
import { pageLabel, pageSummary } from './listing-text';
import { knownQuery, readListingQuery, toQueryParams, withArea, withCuisine, withRegion, withoutCuisines } from './listing-query';

/** The caterer listing, /caterers (docs/detailed-designs/discovery/browse-listing). */
@Component({
  selector: 'app-listing-page',
  imports: [ActiveFilters, ButtonAnchor, CatererCard, CatererGrid, EmptyState, FilterGroup, Icon, Pagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './listing.page.html',
})
export class ListingPage {
  private readonly api = inject(DiscoveryApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });
  protected readonly query = computed(() => readListingQuery(this.params()));
  protected readonly listing = rxResource({ params: () => this.query(), stream: ({ params }) => this.api.listing(params) });
  protected readonly view = computed(() => (this.listing.hasValue() ? this.listing.value() : undefined));
  /** The last results shown, kept while the next ones load so the filters do not flash. */
  protected readonly shown = linkedSignal<ListingPageView | undefined, ListingPageView | undefined>({
    source: this.view,
    computation: (v, previous) => v ?? previous?.value,
  });
  /** The URL's filters without values the listing does not know (L2-003.3). */
  private readonly known = computed(() => knownQuery(this.query(), this.shown()));

  protected readonly cuisines = computed(() => (this.shown() ? cuisineOptions(this.shown()!, this.query()) : []));
  protected readonly areas = computed(() => (this.shown() ? areaOptions(this.shown()!, this.query()) : []));
  protected readonly allCuisinesHref = computed(() => this.href(withoutCuisines(this.known())));
  protected readonly chips = computed(() => (this.shown() ? activeChips(this.shown()!, this.query()) : []));
  protected readonly removeFilterLabel = removeFilterLabel;
  protected readonly noResults = computed(() => {
    const v = this.view();
    return v && v.total === 0 ? noResultsText(v, this.query()) : null;
  });
  protected readonly caterersNoun = caterersNoun;
  protected readonly moreCuisines = moreCuisines;

  protected readonly pageLabel = pageLabel;
  protected readonly summary = computed(() => {
    const v = this.view();
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
  }

  protected toggleCuisine(e: { value: string; pressed: boolean }): void {
    this.go(withCuisine(this.known(), e.value, e.pressed));
  }

  protected toggleArea(e: { value: string; pressed: boolean }): void {
    const { kind, id } = parseAreaValue(e.value);
    this.go(kind === 'region' ? withRegion(this.known(), id, e.pressed) : withArea(this.known(), id, e.pressed));
  }

  protected removeChip(value: string): void {
    this.go(withoutChip(this.known(), value));
  }

  protected focusResults(): void {
    this.resultsHeading().nativeElement.focus();
  }

  private go(q: ListingQuery): void {
    void this.router.navigate(['/caterers'], { queryParams: toQueryParams(q) });
  }

  private href(q: ListingQuery): string {
    return this.router.serializeUrl(this.router.createUrlTree(['/caterers'], { queryParams: toQueryParams(q) }));
  }
}

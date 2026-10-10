import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CatererCard, CatererGrid, Pagination } from '@sweet-hand/components';
import { DiscoveryApi } from '../../../core/api/discovery-api';
import { pageLabel, pageSummary } from './listing-text';
import { readListingQuery, toQueryParams } from './listing-query';

/** The caterer listing, /caterers (docs/detailed-designs/discovery/browse-listing). */
@Component({
  selector: 'app-listing-page',
  imports: [CatererCard, CatererGrid, Pagination],
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

  protected readonly pageLabel = pageLabel;
  protected readonly summary = computed(() => {
    const v = this.view();
    return v ? pageSummary(v.page, v.pageSize, v.total) : null;
  });
  protected readonly hrefFor = (page: number): string =>
    this.router.serializeUrl(this.router.createUrlTree(['/caterers'], { queryParams: toQueryParams({ ...this.query(), page }) }));

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
}

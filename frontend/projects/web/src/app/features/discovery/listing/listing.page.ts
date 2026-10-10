import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CatererCard, CatererGrid } from '@sweet-hand/components';
import { DiscoveryApi } from '../../../core/api/discovery-api';
import { readListingQuery } from './listing-query';

/** The caterer listing, /caterers (docs/detailed-designs/discovery/browse-listing). */
@Component({
  selector: 'app-listing-page',
  imports: [CatererCard, CatererGrid],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './listing.page.html',
})
export class ListingPage {
  private readonly api = inject(DiscoveryApi);
  private readonly route = inject(ActivatedRoute);

  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });
  protected readonly query = computed(() => readListingQuery(this.params()));
  protected readonly listing = rxResource({ params: () => this.query(), stream: ({ params }) => this.api.listing(params) });
  protected readonly view = computed(() => (this.listing.hasValue() ? this.listing.value() : undefined));
}

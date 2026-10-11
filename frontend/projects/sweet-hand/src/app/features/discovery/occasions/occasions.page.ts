import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Button, ButtonAnchor, CatererCard, CatererGrid, EmptyState, Icon, LoadingStatus, delayedBusy } from '@sweet-hand/components';
import { problemOf, reference } from '../../../core/forms/problem';
import { caterersCount } from '../listing/listing-text';
import { DiscoveryService } from '@sweet-hand/api';
import { paths } from '../../../core/routing/paths';

/** Occasions, /occasions: eight photo tiles, each opening the listing for that occasion (docs/mocks/pages/occasions, L2-021). */
@Component({
  selector: 'app-occasions-page',
  imports: [Button, ButtonAnchor, CatererCard, CatererGrid, EmptyState, Icon, LoadingStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './occasions.page.html',
})
export class OccasionsPage {
  protected readonly paths = paths;
  private readonly api = inject(DiscoveryService);

  protected readonly tiles = rxResource({ stream: () => this.api.occasions() });
  protected readonly busy = delayedBusy(this.tiles.isLoading);
  protected readonly list = computed(() => (this.tiles.hasValue() ? this.tiles.value() : []));
  protected readonly failure = computed(() => (this.tiles.status() === 'error' ? { reference: reference(problemOf(this.tiles.error()).problem) } : null));
  protected readonly countText = caterersCount;
}

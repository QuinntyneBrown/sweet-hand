import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { BackLink, Button, Description, DescriptionList, Dish, DishList, Gallery, InlineList, StickyCta } from '@sweet-hand/components';
import { morePhotosLabel, openPhotoLabel } from './gallery-labels';
import { DIETARY_LABELS } from './dietary-labels';
import { CatererPageApi } from '../../../core/api/caterer-page-api';
import { EnquiryLauncher } from '../../../core/enquiry/enquiry-launcher';
import { CatererPageMetadata } from './caterer-meta';
import { guestRange, paragraphs } from './caterer-view';
import { MainLandmark } from './main-landmark';

/** A caterer's public page, /caterers/:slug (docs/detailed-designs/discovery/view-caterer-page). */
@Component({
  selector: 'app-caterer-page',
  imports: [BackLink, Button, Description, DescriptionList, Dish, DishList, Gallery, InlineList, StickyCta],
  providers: [CatererPageMetadata, MainLandmark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './caterer.page.html',
  styleUrl: './caterer.page.css',
})
export class CatererPage {
  readonly slug = input.required<string>();

  private readonly api = inject(CatererPageApi);
  private readonly metadata = inject(CatererPageMetadata);
  private readonly main = inject(MainLandmark);
  private readonly launcher = inject(EnquiryLauncher);

  protected readonly caterer = rxResource({ params: () => this.slug(), stream: ({ params }) => this.api.caterer(params) });
  protected readonly view = computed(() => (this.caterer.hasValue() ? this.caterer.value() : undefined));
  protected readonly paragraphs = computed(() => paragraphs(this.view()?.description ?? ''));
  protected readonly guests = computed(() => {
    const v = this.view();
    return v ? guestRange(v.minGuests, v.maxGuests) : '';
  });

  protected readonly allDishes = signal(false);
  protected readonly showAllDishes = computed(() => $localize`:@@caterer.showAllDishes:Show all ${this.view()?.dishes.length ?? 0}:count: dishes`);
  protected readonly dishesShown = computed(() => $localize`:@@caterer.dishesShown:${this.view()?.dishes.length ?? 0}:count: dishes shown`);
  protected readonly tagLabels = DIETARY_LABELS;
  protected readonly openPhotoLabel = openPhotoLabel;
  protected readonly morePhotosLabel = morePhotosLabel;

  constructor() {
    effect(() => {
      const v = this.view();
      if (v) this.metadata.write(v);
    });
    effect(() => this.main.set(this.view() ? ['container', 'has-sticky-cta'] : ['container']));
    inject(DestroyRef).onDestroy(() => this.metadata.clear());
  }

  protected enquire(event: MouseEvent): void {
    const v = this.view();
    const trigger = (event.target as HTMLElement).closest('button');
    if (v && trigger) this.launcher.open({ slug: v.slug, name: v.name }, trigger);
  }
}

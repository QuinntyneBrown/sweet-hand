import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import {
  Alert,
  BackLink,
  Button,
  Description,
  DescriptionList,
  Dish,
  DishList,
  ErrorPage,
  Gallery,
  Icon,
  InlineList,
  PhotoRow,
  PhotoViewer,
  RatingSummary,
  StickyCta,
  type RowPhoto,
} from '@sweet-hand/components';
import { CatererPageApi } from '../../../core/api/caterer-page-api';
import type { CatererGoneView } from '../../../core/api/caterer-page.models';
import { EnquiryLauncher } from '../../../core/enquiry/enquiry-launcher';
import { problemOf, reference } from '../../../core/forms/problem';
import { ReviewsSection } from '../../reviews/reviews-section/reviews-section';
import { reviewCount } from '../../reviews/reviews-section/review-labels';
import { CatererPageMetadata } from './caterer-meta';
import { guestRange, paragraphs } from './caterer-view';
import { DIETARY_LABELS } from './dietary-labels';
import { VIEWER_LABELS, morePhotosLabel, openPhotoLabel, photoCountLabel } from './gallery-labels';
import { MainLandmark } from './main-landmark';
import { ReportDialog } from './report-dialog/report-dialog';
import { Connectivity } from './connectivity';

type PageState = 'loading' | 'ready' | 'gone' | 'not-found' | 'error';

/** The decorative photos above "We couldn't load …" (docs/mocks/pages/caterer/error.html); the middle one is a placeholder. */
const ERROR_PHOTOS: RowPhoto[] = [
  { src: '/media/pelau-house.jpg?w=400&fm=jpeg', alt: '', width: 72, height: 72 },
  { src: '', alt: '', width: 104, height: 104 },
  { src: '/media/sunday-pot.jpg?w=400&fm=jpeg', alt: '', width: 72, height: 72 },
];

/** A caterer's public page, /caterers/:slug (docs/detailed-designs/discovery/view-caterer-page). */
@Component({
  selector: 'app-caterer-page',
  imports: [
    Alert,
    RouterLink,
    BackLink,
    Button,
    Description,
    DescriptionList,
    Dish,
    DishList,
    ErrorPage,
    Gallery,
    Icon,
    InlineList,
    PhotoRow,
    PhotoViewer,
    RatingSummary,
    StickyCta,
    ReviewsSection,
    ReportDialog,
  ],
  providers: [CatererPageMetadata, MainLandmark, Connectivity],
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
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  protected readonly connection = inject(Connectivity);
  /** Sending needs a connection; the page itself stays readable (L2-091). */
  protected readonly offline = computed(() => !this.connection.online());

  protected readonly caterer = rxResource({ params: () => this.slug(), stream: ({ params }) => this.api.caterer(params) });
  protected readonly view = computed(() => (this.caterer.hasValue() ? this.caterer.value() : undefined));
  private readonly failure = computed(() => (this.caterer.status() === 'error' ? problemOf(this.caterer.error()) : null));

  /** Published, removed (410), not found (404, L2-014.2), failed, or still loading (L2-018.5). */
  protected readonly state = computed<PageState>(() => {
    if (this.view()) return 'ready';
    const failure = this.failure();
    if (!failure) return 'loading';
    if (failure.status === 410) return 'gone';
    if (failure.status === 404) return 'not-found';
    return 'error';
  });
  protected readonly errorReference = computed(() => reference(this.failure()?.problem ?? {}));
  protected readonly errorPhotos = ERROR_PHOTOS;
  protected readonly goneText = computed(() => {
    const count = (this.failure()?.problem as Partial<CatererGoneView> | undefined)?.publishedCount ?? 0;
    return $localize`:@@caterer.gone.text:The page you followed is no longer available. There are ${count}:count: other caterers cooking across Toronto and the GTA.`;
  });

  protected readonly paragraphs = computed(() => paragraphs(this.view()?.description ?? ''));
  protected readonly guests = computed(() => {
    const v = this.view();
    return v ? guestRange(v.minGuests, v.maxGuests) : '';
  });

  protected readonly allDishes = signal(false);
  protected readonly showAllDishes = computed(() => $localize`:@@caterer.showAllDishes:Show all ${this.view()?.dishes.length ?? 0}:count: dishes`);
  protected readonly dishesShown = computed(() => $localize`:@@caterer.dishesShown:${this.view()?.dishes.length ?? 0}:count: dishes shown`);
  protected readonly tagLabels = DIETARY_LABELS;
  protected readonly reviewCount = reviewCount;

  /** The photo the viewer shows, or null while it is closed. */
  protected readonly viewerAt = signal<number | null>(null);
  protected readonly photosTitle = computed(() => $localize`:@@viewer.title:${this.view()?.name ?? ''}:name: photos`);
  protected readonly openPhotoLabel = openPhotoLabel;
  protected readonly morePhotosLabel = morePhotosLabel;
  protected readonly photoCountLabel = photoCountLabel;
  protected readonly viewerLabels = VIEWER_LABELS;
  private readonly gallery = viewChild(Gallery);

  constructor() {
    effect(() => {
      const v = this.view();
      if (!v) return;
      // A retired slug answered 301 and the browser followed it: show the current address (L2-018.3).
      if (v.slug !== untracked(this.slug)) {
        void this.router.navigate(['/caterers', v.slug], { replaceUrl: true });
        return;
      }
      this.metadata.write(v);
    });
    effect(() => {
      const state = this.state();
      untracked(() => {
        this.main.set(state === 'ready' ? ['container', 'has-sticky-cta'] : state === 'gone' || state === 'not-found' ? [] : ['container']);
        if (state === 'gone') this.title.setTitle($localize`:@@caterer.gone.title:Caterer has left · Sweet Hand`);
        // Unpublished and unknown caterers get the one "Page not found" at the same address (L2-014.2).
        if (state === 'not-found') void this.router.navigateByUrl('/404', { skipLocationChange: true });
      });
    });
    inject(DestroyRef).onDestroy(() => this.metadata.clear());
  }

  /** Focus goes back to the photo that was showing, or the thumbnail standing for it (L2-016.4, gallery D-5). */
  protected closeViewer(index: number): void {
    this.viewerAt.set(null);
    this.gallery()?.focusPhoto(index);
  }

  /** The button that opened the report dialog, while it is open. */
  protected readonly reportFrom = signal<HTMLElement | null>(null);

  protected openReport(event: MouseEvent): void {
    this.reportFrom.set((event.target as HTMLElement).closest('button'));
  }

  protected enquire(event: MouseEvent): void {
    const v = this.view();
    const trigger = (event.target as HTMLElement).closest('button');
    if (v && trigger) this.launcher.open({ slug: v.slug, name: v.name }, trigger);
  }
}

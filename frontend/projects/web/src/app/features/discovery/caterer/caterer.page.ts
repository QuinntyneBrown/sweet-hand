import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { BackLink } from '@sweet-hand/components';
import { CatererPageApi } from '../../../core/api/caterer-page-api';
import { CatererPageMetadata } from './caterer-meta';
import { paragraphs } from './caterer-view';
import { MainLandmark } from './main-landmark';

/** A caterer's public page, /caterers/:slug (docs/detailed-designs/discovery/view-caterer-page). */
@Component({
  selector: 'app-caterer-page',
  imports: [BackLink],
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

  protected readonly caterer = rxResource({ params: () => this.slug(), stream: ({ params }) => this.api.caterer(params) });
  protected readonly view = computed(() => (this.caterer.hasValue() ? this.caterer.value() : undefined));
  protected readonly paragraphs = computed(() => paragraphs(this.view()?.description ?? ''));

  constructor() {
    effect(() => {
      const v = this.view();
      if (v) this.metadata.write(v);
    });
    effect(() => this.main.set(['container']));
    inject(DestroyRef).onDestroy(() => this.metadata.clear());
  }
}

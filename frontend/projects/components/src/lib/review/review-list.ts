import { ChangeDetectionStrategy, Component, computed, contentChildren, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Review, REVIEW_LIST } from './review';

/** The ruled list of reviews with its loading state (review CRD, `sh-review-list`). */
@Component({
  selector: 'sh-review-list',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  providers: [{ provide: REVIEW_LIST, useValue: true }],
  templateUrl: './review-list.html',
})
export class ReviewList {
  readonly busy = input(false);
  readonly skeletonCount = input(3);
  readonly skeletonVariant = input<'public' | 'operator'>('public');
  readonly listId = input<string | null>(null);

  protected readonly reviews = contentChildren(Review);
  protected readonly skeletons = computed(() => Array.from({ length: this.skeletonCount() }, (_, i) => i));
}

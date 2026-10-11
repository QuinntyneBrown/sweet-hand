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
  template: `
    <ul class="review-list" [attr.id]="listId()" [attr.aria-busy]="busy() ? 'true' : null">
      @if (busy()) {
        @for (i of skeletons(); track i) {
          @if (skeletonVariant() === 'operator') {
            <li class="review" aria-hidden="true">
              <div class="review__head"><span class="photo photo--xs"><span class="skeleton skeleton--circle"></span></span><span class="skeleton skeleton--text" style="width: 40%"></span></div>
              <span class="skeleton skeleton--text" style="width: 30%"></span><span class="skeleton skeleton--text" style="width: 90%"></span><span class="skeleton skeleton--text" style="width: 60%"></span>
              <span class="skeleton skeleton--rect" style="height: var(--control-height-sm)"></span>
            </li>
          } @else {
            <li class="review" aria-hidden="true">
              <span class="skeleton skeleton--text" style="width: 12rem"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text" style="width: 70%"></span>
            </li>
          }
        }
      } @else {
        @for (r of reviews(); track r) {
          <ng-container *ngTemplateOutlet="r.item()" />
        }
      }
    </ul>
    <ng-content />
  `,
})
export class ReviewList {
  readonly busy = input(false);
  readonly skeletonCount = input(3);
  readonly skeletonVariant = input<'public' | 'operator'>('public');
  readonly listId = input<string | null>(null);

  protected readonly reviews = contentChildren(Review);
  protected readonly skeletons = computed(() => Array.from({ length: this.skeletonCount() }, (_, i) => i));
}

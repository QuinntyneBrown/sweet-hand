import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  TemplateRef,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Button } from '../button/button';
import { Tags, type DietaryTag } from '../tag/tag';

interface DishListContext {
  isCollapsed(dish: Dish): boolean;
}

const DISH_LIST = new InjectionToken<DishListContext>('DISH_LIST');

/**
 * One menu item (docs/specs/components/dish.md). In `layout="menu"` it renders
 * nothing where it stands: its `sh-dish-list` places the `li.dish` directly in
 * the `ul`, so the list holds only `li` children. In `layout="row"` it renders
 * its parts in place, inside the consumer's `.edit-row__body`.
 */
@Component({
  selector: 'sh-dish',
  imports: [NgTemplateOutlet, Tags],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (layout() === 'row') {
      <div class="dish__top"><span class="dish__name">{{ name() }}</span><ng-container *ngTemplateOutlet="price" /></div>
      <ng-container *ngTemplateOutlet="rest" />
    }
    <ng-template #item>
      @if (skeleton()) {
        <li class="dish dish--skeleton" aria-hidden="true"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></li>
      } @else {
        <!-- .dish sets display, which beats the hidden attribute's UA rule -->
        <li class="dish" [hidden]="collapsed()" [style.display]="collapsed() ? 'none' : null">
          <div class="dish__top">
            @switch (headingLevel()) {
              @case (4) {
                <h4 class="dish__name">{{ name() }}</h4>
              }
              @case (5) {
                <h5 class="dish__name">{{ name() }}</h5>
              }
              @default {
                <h3 class="dish__name">{{ name() }}</h3>
              }
            }
            <ng-container *ngTemplateOutlet="price" />
          </div>
          <ng-container *ngTemplateOutlet="rest" />
        </li>
      }
    </ng-template>
    <ng-template #price>
      @if (priceText()) {
        <span class="dish__price">{{ priceText() }}</span>
      }
    </ng-template>
    <ng-template #rest>
      @if (description()) {
        <p class="dish__desc">{{ description() }}</p>
      }
      @if (tags().length) {
        <sh-tags [values]="tags()" [labels]="tagLabels()!" [changed]="changedTags()" />
      }
    </ng-template>
  `,
})
export class Dish {
  readonly name = input('');
  readonly price = input<string | null>(null);
  readonly description = input<string | null>(null);
  readonly tags = input<readonly DietaryTag[] | readonly string[]>([]);
  readonly tagLabels = input<Record<DietaryTag, string> | null>(null);
  readonly changedTags = input<readonly string[]>([]);
  readonly headingLevel = input<3 | 4 | 5>(3);
  readonly layout = input<'menu' | 'row'>('menu');
  readonly skeleton = input(false);

  /** The `li.dish`, placed by the parent list. */
  readonly item = viewChild.required<TemplateRef<unknown>>('item');
  private readonly list = inject(DISH_LIST, { optional: true });
  /** Past the parent list's collapsed count and not expanded. */
  protected readonly collapsed = computed(() => this.list?.isCollapsed(this) ?? false);
  protected readonly priceText = computed(() => this.price()?.trim() || null);
}

/**
 * The ruled menu list with its loading state and "Show all" toggle (dish CRD,
 * `sh-dish-list`). Expanding shows dishes already on the page: no request (D-5).
 */
@Component({
  selector: 'sh-dish-list',
  imports: [NgTemplateOutlet, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  providers: [{ provide: DISH_LIST, useExisting: forwardRef(() => DishList) }],
  template: `
    <ul class="dish-list" [id]="listId()" [attr.aria-busy]="busy() ? 'true' : null">
      @if (busy()) {
        @for (i of skeletons(); track i) {
          <li class="dish dish--skeleton" aria-hidden="true"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></li>
        }
      } @else {
        @for (d of dishes(); track d) {
          <ng-container *ngTemplateOutlet="d.item()" />
        }
      }
    </ul>
    @if (!busy() && toggleable()) {
      <p class="dish-list__toggle">
        <sh-button [expanded]="expanded()" [controls]="listId()" (activated)="toggle()">{{ expanded() ? showFewerLabel() : showAllLabel() }}</sh-button>
      </p>
      <p class="visually-hidden" role="status" aria-live="polite">{{ announcement() }}</p>
    }
    <ng-content />
  `,
  styles: `.dish-list__toggle { margin-top: var(--space-6); }`,
})
export class DishList implements DishListContext {
  readonly listId = input.required<string>();
  readonly busy = input(false);
  readonly skeletonCount = input(6);
  readonly collapsedCount = input<number | null>(12);
  readonly expanded = model(false);
  readonly showAllLabel = input<string | null>(null);
  readonly showFewerLabel = input<string | null>(null);
  readonly expandedAnnouncement = input<string | null>(null);

  protected readonly dishes = contentChildren(Dish);
  protected readonly skeletons = computed(() => Array.from({ length: this.skeletonCount() }, (_, i) => i));
  protected readonly toggleable = computed(() => {
    const limit = this.collapsedCount();
    return limit !== null && this.dishes().length > limit;
  });
  protected readonly announcement = signal('');

  /** Dishes past the collapsed count stay in the page, hidden, until expanded (L2-017.4). */
  isCollapsed(dish: Dish): boolean {
    const limit = this.collapsedCount();
    return limit !== null && !this.expanded() && this.dishes().indexOf(dish) >= limit;
  }

  protected toggle(): void {
    const next = !this.expanded();
    this.expanded.set(next);
    // Expanding is announced; collapsing is not, the toggle's name says it (D-6).
    this.announcement.set(next ? (this.expandedAnnouncement() ?? '') : '');
  }
}

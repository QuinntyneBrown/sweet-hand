import { ChangeDetectionStrategy, Component, computed, contentChildren, forwardRef, input, model, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Button } from '../button/button';
import { Dish, DISH_LIST } from './dish';
import type { DishListContext } from './dish-list-context';

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

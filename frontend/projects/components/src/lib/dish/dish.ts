import { ChangeDetectionStrategy, Component, computed, inject, InjectionToken, input, TemplateRef, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Tags } from '../tag/tags';
import type { DietaryTag } from '../tag/dietary-tag';
import type { DishListContext } from './dish-list-context';

export const DISH_LIST = new InjectionToken<DishListContext>('DISH_LIST');

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
  templateUrl: './dish.html',
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


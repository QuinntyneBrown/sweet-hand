import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';
import type { DietaryTag } from './dietary-tag';

/** The fixed dietary list of L2-017.3, in its canonical order (tag CRD D-2). */
export const DIETARY_TAGS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal', 'contains-nuts', 'contains-shellfish', 'spicy'] as const;

/** Allergens carry the warning icon and `.tag--allergen`, decided by the value (D-2, D-3). */
export function isAllergen(value: DietaryTag): boolean {
  return value === 'contains-nuts' || value === 'contains-shellfish';
}

/** One tag, `li.tag` (tag CRD, `sh-tag`), for rows built by hand. */
@Component({
  selector: 'sh-tag',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (changed()) {
      <li><ins class="diff-new"><span [class]="cls()">@if (allergen()) {<svg shIcon="warning"></svg>}{{ label() }}</span></ins></li>
    } @else {
      <li [class]="cls()">@if (allergen()) {<svg shIcon="warning"></svg>}{{ label() }}</li>
    }
  `,
})
export class Tag {
  readonly value = input.required<DietaryTag>();
  readonly label = input.required<string>();
  readonly changed = input(false);

  protected readonly allergen = computed(() => isAllergen(this.value()));
  protected readonly cls = computed(() => (this.allergen() ? 'tag tag--allergen' : 'tag'));
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from '../icon/icon';

/** The fixed dietary list of L2-017.3, in its canonical order (tag CRD D-2). */
export const DIETARY_TAGS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal', 'contains-nuts', 'contains-shellfish', 'spicy'] as const;

export type DietaryTag = (typeof DIETARY_TAGS)[number];

/** Allergens carry the warning icon and `.tag--allergen`, decided by the value (D-2, D-3). */
export function isAllergen(value: DietaryTag): boolean {
  return value === 'contains-nuts' || value === 'contains-shellfish';
}

/**
 * The row of dietary and allergen tags on a dish (docs/specs/components/tag.md).
 * Sorts into the fixed order, drops duplicates and unknown values, and renders
 * nothing when there are no tags.
 */
@Component({
  selector: 'sh-tags',
  imports: [Icon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (skeleton()) {
      <ul class="tags" aria-hidden="true">
        <li class="skeleton skeleton--text tag-skeleton" style="width: 4rem"></li>
        <li class="skeleton skeleton--text tag-skeleton" style="width: 6rem"></li>
      </ul>
    } @else if (sorted().length) {
      <ul class="tags">
        @for (value of sorted(); track value) {
          @if (changed().includes(value)) {
            <li><ins class="diff-new"><span [class]="cls(value)"><ng-container *ngTemplateOutlet="body; context: { $implicit: value }" /></span></ins></li>
          } @else {
            <li [class]="cls(value)"><ng-container *ngTemplateOutlet="body; context: { $implicit: value }" /></li>
          }
        }
      </ul>
    }
    <ng-template #body let-value>@if (allergen(value)) {<svg shIcon="warning"></svg>}{{ label(value) }}</ng-template>
  `,
  styles: `.tag-skeleton { border-radius: var(--radius-full); }`,
})
export class Tags {
  readonly values = input<readonly string[]>([]);
  readonly labels = input.required<Record<DietaryTag, string>>();
  readonly changed = input<readonly string[]>([]);
  readonly skeleton = input(false);

  protected readonly sorted = computed(() => DIETARY_TAGS.filter((t) => this.values().includes(t)));
  protected readonly allergen = isAllergen;

  protected label(value: DietaryTag): string {
    return this.labels()[value];
  }

  protected cls(value: DietaryTag): string {
    return isAllergen(value) ? 'tag tag--allergen' : 'tag';
  }
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

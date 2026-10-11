import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { NgTemplateOutlet } from '@angular/common';
import type { DietaryTag } from './dietary-tag';
import { DIETARY_TAGS, isAllergen } from './tag';

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

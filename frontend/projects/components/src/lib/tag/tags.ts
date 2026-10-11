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
  templateUrl: './tags.html',
  styleUrl: './tags.css',
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

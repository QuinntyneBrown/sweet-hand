import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Check } from './check';
import type { CheckStatus } from './check-status';
import { Checklist } from './checklist';

/**
 * One line of a checklist (checklist CRD, `sh-checklist-item`). `status` null
 * renders a plain or icon line. Used as an attribute on the `li` itself
 * (`<li sh-checklist-item status="done">`): an element host between the list
 * and its `li` would break the list's semantics, `display: contents` or not.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-checklist-item]',
  imports: [Check],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-missing]': "status() === 'missing' ? '' : null", '[attr.data-highlight]': "highlight() ? '' : null" },
  templateUrl: './checklist-item.html',
})
export class ChecklistItem {
  readonly status = input.required<CheckStatus | null>();
  readonly highlight = input(false);

  private readonly list = inject(Checklist, { optional: true });

  protected readonly prefix = computed(() => {
    const s = this.status();
    if (!s || !this.list?.prefixes()) return null;
    return this.list.statusLabels()?.[s] ?? null;
  });
}

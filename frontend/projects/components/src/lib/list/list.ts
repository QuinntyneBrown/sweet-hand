import { ChangeDetectionStrategy, Component, computed, ElementRef, input, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { ListFamily } from './list-family';

const LIST_CLASS: Record<ListFamily, string> = {
  list: 'list',
  device: 'list device-list',
  settings: 'admin-list',
  editable: 'edit-list',
  breach: 'breach-list',
};

/**
 * Rows of settings and records: device, settings, editable and breach lists
 * (docs/specs/components/list.md). Rows are the `li[sh-…]` row components of
 * the same family, so the list's children stay `li` elements.
 */
@Component({
  selector: 'sh-list',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  templateUrl: './list.html',
})
export class List {
  readonly family = input<ListFamily>('list');
  readonly ordered = input<boolean | null>(null);
  readonly label = input<string | null>(null);
  readonly labelledBy = input<string | null>(null);
  readonly busy = input(false);
  readonly busyLabel = input<string>('');
  readonly skeletonCount = input(3);
  readonly skeletonAvatar = input(false);
  readonly skeletonAction = input<boolean | null>(null);
  readonly announcement = input<string | null>(null);

  private readonly listEl = viewChild<ElementRef<HTMLElement>>('listEl');

  protected readonly isOrdered = computed(() => this.ordered() ?? this.family() === 'editable');
  protected readonly listClass = computed(() => LIST_CLASS[this.family()]);
  protected readonly ariaLabel = computed(() => (this.busy() ? this.busyLabel() : this.label()));
  protected readonly skeletons = computed(() => Array.from({ length: Math.min(20, Math.max(1, Math.round(this.skeletonCount()))) }, (_, i) => i));
  protected readonly hasSkeletonAction = computed(() => this.skeletonAction() ?? this.family() === 'settings');

  /** Focuses the first enabled control of row `index`, or the list's heading past the end (D-6). */
  focusItem(index: number): void {
    const rows = Array.from(this.listEl()?.nativeElement.children ?? []) as HTMLElement[];
    const row = rows[index];
    if (row) {
      const control = row.querySelector<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
      control?.focus();
      return;
    }
    const heading = this.labelledBy() ? document.getElementById(this.labelledBy()!) : null;
    if (heading) {
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }
}


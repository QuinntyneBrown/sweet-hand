import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * The button that opens filters: "Filters" on phones (opens the sheet) or a
 * group's dropdown on tablets (docs/specs/components/filter-trigger.md).
 * The count bubble is read as part of the name: "Filters, 2 active" (D-2).
 */
@Component({
  selector: 'sh-filter-trigger',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './filter-trigger.html',
})
export class FilterTrigger {
  readonly label = input.required<string>();
  readonly mode = input<'dialog' | 'dropdown'>('dropdown');
  readonly expanded = input(false);
  readonly controls = input<string | null>(null);
  readonly count = input(0);
  readonly countLabel = input<string | null>(null);
  readonly disabled = input(false);

  readonly activated = output<MouseEvent>();

  private readonly el = viewChild.required<ElementRef<HTMLButtonElement>>('el');

  /**
   * Chrome adds a space before the bubble's hidden comma ("Filters , 2 active")
   * because the bubble is not an inline box, so the name is given explicitly.
   */
  protected readonly name = computed(() => (this.count() > 0 ? `${this.label()}, ${this.count()} ${this.countLabel() ?? ''}`.trim() : null));

  get element(): HTMLButtonElement {
    return this.el().nativeElement;
  }

  focus(options?: FocusOptions): void {
    this.el().nativeElement.focus(options);
  }
}

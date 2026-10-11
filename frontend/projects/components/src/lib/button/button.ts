import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, viewChild } from '@angular/core';
import type { Variant } from './variant';
import type { Size } from './size';

export function classes(variant: Variant, size: Size, block: boolean, wrap: boolean, iconOnly: boolean): string {
  return [
    'btn',
    variant !== 'secondary' && `btn--${variant}`,
    size !== 'md' && `btn--${size}`,
    block && 'btn--block',
    wrap && 'btn--wrap',
    iconOnly && 'btn--icon',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * A button (docs/specs/components/button.md). Busy keeps the label, width and
 * focus and ignores activation; it never uses native `disabled` (D-3, D-4).
 */
@Component({
  selector: 'sh-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './button.html',
})
export class Button {
  readonly variant = input<Variant>('secondary');
  readonly size = input<Size>('md');
  readonly block = input(false);
  readonly wrap = input(false);
  readonly iconOnly = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly form = input<string | null>(null);
  readonly busy = input(false);
  readonly disabled = input(false);
  readonly disabledFocusable = input(false);
  readonly pressed = input<boolean | null>(null);
  readonly expanded = input<boolean | null>(null);
  readonly controls = input<string | null>(null);
  readonly haspopup = input<'dialog' | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly describedBy = input<string | null>(null);
  /** Extra classes from the consumer (`push-start`, layout helpers). */
  readonly extraClass = input('');

  readonly activated = output<MouseEvent>();

  private readonly el = viewChild.required<ElementRef<HTMLButtonElement>>('el');
  protected readonly cls = computed(() =>
    `${classes(this.variant(), this.size(), this.block(), this.wrap(), this.iconOnly())} ${this.extraClass()}`.trim(),
  );

  get element(): HTMLButtonElement {
    return this.el().nativeElement;
  }

  focus(options?: FocusOptions): void {
    this.el().nativeElement.focus(options);
  }

  protected onClick(event: MouseEvent): void {
    if (this.busy() || (this.disabled() && this.disabledFocusable())) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.activated.emit(event);
  }
}


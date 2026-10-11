import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Variant } from './variant';
import type { Size } from './size';
import { classes } from './button';

/** A link that looks like a button (`sh-button-anchor`); disabled renders `aria-disabled`. */
@Component({
  selector: 'sh-button-anchor',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './button-anchor.html',
})
export class ButtonAnchor {
  readonly variant = input<Variant>('secondary');
  readonly size = input<Size>('md');
  readonly block = input(false);
  readonly wrap = input(false);
  readonly href = input.required<string>();
  readonly queryParams = input<Record<string, unknown> | null>(null);
  readonly disabled = input(false);
  readonly ariaLabel = input<string | null>(null);
  readonly describedBy = input<string | null>(null);

  protected readonly cls = computed(() => classes(this.variant(), this.size(), this.block(), this.wrap(), false));

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) event.preventDefault();
  }
}

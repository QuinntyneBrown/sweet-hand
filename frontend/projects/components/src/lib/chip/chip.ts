import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

/** A pill: toggle (`aria-pressed`), link or static (docs/specs/components/chip.md). */
@Component({
  selector: 'sh-chip',
  imports: [RouterLink, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './chip.html',
})
export class Chip {
  readonly kind = input<'toggle' | 'link' | 'static'>('toggle');
  readonly pressed = model(false);
  readonly href = input<string | null>(null);
  readonly current = input(false);
  readonly disabled = input(false);

  protected toggle(): void {
    if (this.disabled()) return;
    this.pressed.set(!this.pressed());
  }
}


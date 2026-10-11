import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

/** A pill: toggle (`aria-pressed`), link or static (docs/specs/components/chip.md). */
@Component({
  selector: 'sh-chip',
  imports: [RouterLink, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <ng-template #label><ng-content /></ng-template>
    @switch (kind()) {
      @case ('link') {
        <a
          class="chip"
          [routerLink]="href()"
          [attr.aria-current]="current() ? 'page' : null"
          [attr.aria-disabled]="disabled() ? 'true' : null"
          (click)="disabled() && $event.preventDefault()"
          ><ng-container [ngTemplateOutlet]="label"
        /></a>
      }
      @case ('static') {
        <span class="chip" [attr.aria-disabled]="disabled() ? 'true' : null"><ng-container [ngTemplateOutlet]="label" /></span>
      }
      @default {
        <button class="chip" type="button" [attr.aria-pressed]="pressed()" [disabled]="disabled()" (click)="toggle()"><ng-container [ngTemplateOutlet]="label" /></button>
      }
    }
  `,
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


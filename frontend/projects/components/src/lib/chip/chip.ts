import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';

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

/** An active filter with its remove button (`span.chip.chip--filter`). */
@Component({
  selector: 'sh-filter-chip',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<span class="chip chip--filter"
    ><ng-content /><button #remove class="remove" type="button" [attr.aria-label]="removeLabel()" [disabled]="removeDisabled()" (click)="onRemove()"><svg shIcon="close" class="icon--sm"></svg></button
  ></span>`,
})
export class FilterChip {
  readonly removeLabel = input.required<string>();
  readonly removeDisabled = input(false);
  readonly removed = output<void>();

  private readonly group = inject(forwardRef(() => ChipGroup), { optional: true });
  private readonly removeButton = viewChild.required<ElementRef<HTMLButtonElement>>('remove');

  focusRemove(): void {
    this.removeButton().nativeElement.focus();
  }

  protected onRemove(): void {
    this.group?.noteRemoval(this);
    this.removed.emit();
  }
}

/**
 * A labelled row of chips (`div.active-filters[role=group]`). After a filter
 * chip is removed, focus goes to the next chip, then to "Clear filters", and
 * otherwise `emptied` asks the page to move it (D-6). Renders nothing without chips.
 */
@Component({
  selector: 'sh-chip-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (filled()) {
      <div #row class="active-filters" role="group" [attr.aria-label]="label()">
        <ng-content />
      </div>
    }
  `,
})
export class ChipGroup {
  readonly label = input.required<string>();
  // The CRD names this output; it never fires as the media "emptied" event.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly emptied = output<void>();

  private readonly filterChips = contentChildren(FilterChip, { descendants: true });
  private readonly chips = contentChildren(Chip, { descendants: true });
  protected readonly filled = computed(() => this.filterChips().length + this.chips().length > 0);
  private readonly row = viewChild<ElementRef<HTMLElement>>('row');
  private readonly injector = inject(Injector);
  private removedAt: number | null = null;

  constructor() {
    effect(() => {
      const chips = this.filterChips();
      untracked(() => {
        const index = this.removedAt;
        if (index === null) return;
        this.removedAt = null;
        afterNextRender(() => this.moveFocus(chips, index), { injector: this.injector });
      });
    });
  }

  noteRemoval(chip: FilterChip): void {
    this.removedAt = this.filterChips().indexOf(chip);
  }

  private moveFocus(chips: readonly FilterChip[], index: number): void {
    if (chips[index]) return chips[index].focusRemove();
    const clear = this.row()?.nativeElement.querySelector<HTMLElement>('a[href]');
    if (clear) return clear.focus();
    if (chips.length) return chips[chips.length - 1].focusRemove();
    this.emptied.emit();
  }
}

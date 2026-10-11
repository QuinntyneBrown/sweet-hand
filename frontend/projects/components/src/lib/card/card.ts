import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * A bounded surface for one self-contained thing (docs/specs/components/card.md).
 * With `href` the whole card is one link: the title's link is stretched over it.
 */
@Component({
  selector: 'sh-card',
  imports: [NgTemplateOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div [class]="cls()" [attr.role]="selectedAttr() ? 'option' : null" [attr.aria-selected]="selectedAttr() ? selected() : null">
      @if (heading() !== null) {
        @if (href()) {
          <ng-container *ngTemplateOutlet="titleTpl" />
        } @else {
          <div class="card__header">
            <ng-container *ngTemplateOutlet="titleTpl" />
            <ng-content select="[slot=meta]" />
          </div>
        }
      }
      <ng-content />
      <ng-content select="[slot=footer]" />
    </div>
    <ng-template #titleTpl>
      @switch (headingLevel()) {
        @case (2) {
          <h2 class="card__title"><ng-container *ngTemplateOutlet="titleText" /></h2>
        }
        @case (4) {
          <h4 class="card__title"><ng-container *ngTemplateOutlet="titleText" /></h4>
        }
        @case (5) {
          <h5 class="card__title"><ng-container *ngTemplateOutlet="titleText" /></h5>
        }
        @case (null) {
          <p class="card__title"><ng-container *ngTemplateOutlet="titleText" /></p>
        }
        @default {
          <h3 class="card__title"><ng-container *ngTemplateOutlet="titleText" /></h3>
        }
      }
    </ng-template>
    <ng-template #titleText>
      @if (href(); as link) {
        <a [routerLink]="link">{{ heading() }}</a>
      } @else {
        {{ heading() }}
      }
    </ng-template>
  `,
})
export class Card {
  readonly flush = input(false);
  /** Makes the whole card one link; the footer and meta slots are not allowed with it. */
  readonly href = input<string | null>(null);
  readonly heading = input<string | null>(null);
  readonly headingLevel = input<2 | 3 | 4 | 5 | null>(3);
  readonly selected = input(false);
  readonly selectedAttr = input(false);

  protected readonly cls = computed(() =>
    ['card', this.flush() && 'card--flush', this.href() && 'card--interactive', this.selected() && 'card--selected'].filter(Boolean).join(' '),
  );
}


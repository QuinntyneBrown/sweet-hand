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
  templateUrl: './card.html',
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


import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { CardPhoto } from './card-photo';

const CARD_SIZES = '(min-width: 62rem) 17.5rem, (min-width: 36rem) 45vw, 90vw';
const OCCASION_SIZES = '(min-width: 62rem) 17.5rem, (min-width: 48rem) 30vw, 45vw';

/**
 * One photo-led card: a caterer in the listing or an occasion tile
 * (docs/specs/components/caterer-card.md). Shows exactly the photo, name and
 * one meta line; it has no slots, so nothing else can be added (L2-004).
 */
@Component({
  selector: 'sh-caterer-card',
  imports: [RouterLink, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (skeleton()) {
      <div class="caterer-card caterer-card--skeleton" aria-hidden="true">
        <span class="photo"><span class="skeleton skeleton--circle"></span></span>
        <span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span>
      </div>
    } @else if (href(); as link) {
      <a class="caterer-card" [routerLink]="path()" [queryParams]="queryParams()">
        <ng-container *ngTemplateOutlet="body" />
      </a>
    } @else {
      <div class="caterer-card"><ng-container *ngTemplateOutlet="body" /></div>
    }
    <ng-template #body>
      @if (photo() && !failed()) {
        <span class="photo">
          <img
            [src]="photo()!.src"
            [attr.srcset]="photo()!.srcset"
            [attr.sizes]="sizes()"
            [alt]="variant() === 'occasion' ? '' : photo()!.alt"
            [width]="photo()!.width"
            [height]="photo()!.height"
            [attr.loading]="effectiveLoading() === 'lazy' ? 'lazy' : null"
            (error)="failed.set(true)"
          />
        </span>
      } @else if (failed()) {
        <span class="photo photo--failed">
          <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /></svg>
          <span class="photo__label">{{ failedLabel() }}</span>
        </span>
      } @else {
        <span class="photo photo--placeholder">
          <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /></svg>
          <span class="photo__label">{{ placeholderLabel() }}</span>
        </span>
      }
      <span class="caterer-card__name">{{ name() }}</span>
      <span class="caterer-card__meta">{{ metaLine() }}</span>
    </ng-template>
  `,
})
export class CatererCard {
  readonly variant = input<'caterer' | 'occasion'>('caterer');
  readonly href = input<string | null>(null);
  readonly name = input('');
  readonly cuisine = input('');
  readonly area = input('');
  readonly meta = input('');
  readonly photo = input<CardPhoto | null>(null);
  readonly loading = input<'eager' | 'lazy'>('lazy');
  readonly placeholderLabel = input('');
  readonly failedLabel = input('');
  readonly skeleton = input(false);

  /** Set once by a parent `sh-caterer-grid` from its eager count (CRD D-8). */
  readonly gridLoading = signal<'eager' | 'lazy' | null>(null);
  protected readonly effectiveLoading = computed(() => this.gridLoading() ?? this.loading());
  protected readonly failed = signal(false);
  protected readonly sizes = computed(() => (this.variant() === 'occasion' ? OCCASION_SIZES : CARD_SIZES));
  protected readonly metaLine = computed(() =>
    this.variant() === 'occasion' ? this.meta() : `${this.cuisine()} · ${this.area()}`,
  );
  protected readonly path = computed(() => (this.href() ?? '').split('?')[0]);
  protected readonly queryParams = computed(() => {
    const query = (this.href() ?? '').split('?')[1];
    return query ? Object.fromEntries(new URLSearchParams(query)) : null;
  });
}

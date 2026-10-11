import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CatererCard } from '@sweet-hand/components';
import type { CardModel } from './profile-text';

/** The listing card as it appears with the current values (set-up-profile, ListingCardPreview). */
@Component({
  selector: 'app-listing-preview',
  imports: [CatererCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <sh-caterer-card
      [href]="href()"
      [name]="card().name"
      [cuisine]="card().cuisine"
      [area]="card().area"
      [photo]="card().photo"
      loading="eager"
      placeholderLabel="Cover photo"
      i18n-placeholderLabel="@@preview.coverPhoto"
      failedLabel="Photo unavailable"
      i18n-failedLabel="@@preview.photoFailed"
    />
  `,
})
export class ListingPreview {
  readonly card = input.required<CardModel>();
  /** The public page while it is published; otherwise a plain card. */
  readonly href = input<string | null>(null);
}

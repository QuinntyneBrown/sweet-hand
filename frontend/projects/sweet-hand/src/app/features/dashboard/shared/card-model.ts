import type { CardPhoto } from '@sweet-hand/components';

/** What the listing card shows: cover, name, primary cuisine and primary area (set-up-profile, ListingCardPreview). */
export interface CardModel {
  name: string;
  cuisine: string;
  area: string;
  photo: CardPhoto | null;
}

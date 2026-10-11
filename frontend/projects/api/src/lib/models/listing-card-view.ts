import type { PhotoView } from './photo-view';

export interface ListingCardView {
  slug: string;
  name: string;
  primaryCuisine: string;
  primaryArea: string;
  cover: PhotoView;
}

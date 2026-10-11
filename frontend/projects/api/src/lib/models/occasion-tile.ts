import type { Occasion } from './occasion';
import type { PhotoView } from './photo-view';

export interface OccasionTile extends Occasion {
  count: number;
  photo: PhotoView;
}

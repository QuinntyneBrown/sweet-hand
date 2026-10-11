import type { DietaryTag } from './dietary-tag';

export interface CatererDishView {
  name: string;
  description: string | null;
  /** Price guidance as the caterer wrote it ("From $16 per person"). */
  price: string | null;
  tags: DietaryTag[];
}

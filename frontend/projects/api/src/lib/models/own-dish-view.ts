import type { DietaryTagId } from './dietary-tag-id';

export interface OwnDishView {
  id: string;
  name: string;
  description: string | null;
  tags: DietaryTagId[];
  price: string | null;
}

import type { DietaryTagId } from './dietary-tag-id';

export interface DishRequest {
  name: string;
  description: string;
  tags: DietaryTagId[];
  price: string;
}

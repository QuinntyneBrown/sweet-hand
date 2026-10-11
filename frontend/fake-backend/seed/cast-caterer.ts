import type { Caterer } from './caterer.ts';
import type { Photo } from './photo.ts';
import type { Dish } from './dish.ts';

export type CastCaterer = Pick<Caterer, 'id' | 'name' | 'status' | 'cuisines' | 'areas' | 'createdAt'> &
  Partial<Omit<Caterer, 'photos' | 'dishes'>> & { photos?: Omit<Photo, 'id'>[]; dishes?: Omit<Dish, 'id'>[] };

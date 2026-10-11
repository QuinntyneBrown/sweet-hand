import { Dish } from './dish';

export interface DishListContext {
  isCollapsed(dish: Dish): boolean;
}

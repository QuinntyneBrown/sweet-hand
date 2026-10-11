import type { OperatorCuisine } from './operator-cuisine';
import type { CuisineUser } from './cuisine-user';

export interface CuisineUsage {
  cuisine: OperatorCuisine;
  caterers: CuisineUser[];
}

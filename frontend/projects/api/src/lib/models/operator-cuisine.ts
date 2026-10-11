/** One entry of the cuisine catalogue as operators see it (manage-cuisine-list). */
export interface OperatorCuisine {
  id: string;
  name: string;
  retired: boolean;
  /** UTC. */
  addedAt: string;
  /** Display name of the operator who added it; absent for the launch list. */
  addedBy?: string | null;
  retiredAt?: string | null;
  /** Published caterers that list this cuisine. */
  publishedCaterers: number;
}

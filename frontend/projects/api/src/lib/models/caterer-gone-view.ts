/** HTTP 410 body for a removed caterer (L2-018.5). Carries nothing about the old profile. */
export interface CatererGoneView {
  title: string;
  /** Published caterers, for "There are 60 other caterers…". */
  publishedCount: number;
}

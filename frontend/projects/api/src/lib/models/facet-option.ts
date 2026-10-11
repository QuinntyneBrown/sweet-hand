export interface FacetOption {
  id: string;
  name: string;
  /** Published caterers that match this option combined with the other active filters (L2-008.3). */
  count: number;
}

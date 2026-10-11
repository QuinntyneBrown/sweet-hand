/**
 * Counts for the export and deletion dialogs (L2-071, L2-072), from the mocks'
 * cast. The enquiries and reviews areas own the real records.
 */
export interface DataSummary {
  enquiries: number;
  reviews: number;
  reports: number;
  photos: number;
  dishes: number;
  reviewResponses: number;
  openEnquiriesWith: string[];
}

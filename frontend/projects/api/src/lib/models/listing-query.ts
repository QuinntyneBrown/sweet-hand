export interface ListingQuery {
  cuisines: string[];
  regions: string[];
  areas: string[];
  occasion?: string;
  page: number;
}

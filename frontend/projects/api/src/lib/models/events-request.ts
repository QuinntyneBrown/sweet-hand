export interface EventsRequest {
  /** As typed, so the server can name a non-numeric entry (L2-020.4). */
  minGuests: string;
  maxGuests: string;
  occasions: string[];
}

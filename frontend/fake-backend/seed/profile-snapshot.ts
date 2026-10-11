/** The profile as it was when an operator requested changes (L2-047.3). */
export interface ProfileSnapshot {
  description: string;
  photoFiles: string[];
  dishNames: string[];
  minGuests: number;
  maxGuests: number;
  occasions: string[];
  areas: string[];
  cuisines: string[];
}

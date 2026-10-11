/** A caterer's contact details as operators see them (L2-014: never public). */
export interface Owner {
  name: string;
  email: string;
  phone: string | null;
}

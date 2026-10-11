/** One published review as anyone may see it (L2-051.3): no email, account id or status (L2-014). */
export interface PublicReviewView {
  id: string;
  /** First name and last initial: "Marcia T.". */
  author: string;
  /** Month of the event, YYYY-MM, shown as "Event in August 2026". */
  eventMonth: string;
  rating: number;
  text: string;
  edited: boolean;
  /** The caterer's public response (L2-052). */
  response: { text: string } | null;
}

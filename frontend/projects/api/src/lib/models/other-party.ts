/** The other party of an enquiry: the caterer for a customer, the customer for a caterer, or a deleted account (L2-072.2). */
export type OtherParty =
  | { kind: 'caterer'; name: string; slug: string; photo: string }
  | { kind: 'customer'; name: string; firstName: string; initials: string }
  | { kind: 'former' };

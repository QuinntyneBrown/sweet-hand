/** What the account page shows about the signed-in person (docs/mocks/pages/account). */
export interface AccountView {
  role: 'Customer' | 'Caterer' | 'Operator';
  displayName: string;
  email: string;
  emailVerified: boolean;
  /** When the latest verification link went out (L2-023.2). */
  verificationSentAt: string | null;
  /** Mail to the address bounced permanently (L2-030.3). */
  emailBounced: boolean;
  /** As entered, "+1 647 555 0187"; null when none was given. */
  phone: string | null;
  memberSince: string;
  passwordChangedAt: string;
  /** The privacy notice version accepted and when (L2-070.3). */
  privacy: { version: string; acceptedAt: string };
  /** Caterers only: the business the account owns. */
  business: { name: string } | null;
  /** An export being prepared (L2-071). */
  dataExport: { requestedAt: string } | null;
  /** What a data export holds (L2-071.1, L2-071.2). */
  exportContents: { enquiries: number; reviews: number; reports: number; photos: number; dishes: number; reviewResponses: number };
  /** What deleting the account removes (L2-072). */
  deletion: { reviews: number; openEnquiries: number; customersToTell: string[] };
}

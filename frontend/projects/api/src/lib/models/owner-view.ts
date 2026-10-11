export interface OwnerView {
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  /** The first time the profile was published, else when the account was created. */
  since: string;
}

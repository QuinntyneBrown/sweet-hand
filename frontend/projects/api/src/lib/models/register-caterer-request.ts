/** A caterer registration (L2-037). */
export interface RegisterCatererRequest {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  password: string;
  sellsCaribbeanFoodInGta: boolean;
  acceptsTermsAndPrivacyNotice: boolean;
  challengeToken: string;
}

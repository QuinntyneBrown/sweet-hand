export interface SignInResult {
  /** Operators still need their second factor (L2-056.2). */
  secondFactorRequired: boolean;
  /** A newer privacy notice must be accepted before continuing (L2-070.4). */
  privacyUpdateRequired: boolean;
}

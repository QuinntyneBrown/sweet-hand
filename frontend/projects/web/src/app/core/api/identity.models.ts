/** Wire types for identity (ADR 0003). Shared with the fake backend; keep import-free. */

export interface SignInRequest {
  email: string;
  password: string;
  /** Required once the network has failed too often (L2-076.5). */
  challengeToken?: string;
}

export interface SignInResult {
  /** Operators still need their second factor (L2-056.2). */
  secondFactorRequired: boolean;
  /** A newer privacy notice must be accepted before continuing (L2-070.4). */
  privacyUpdateRequired: boolean;
}

/** 423 body when sign-in is paused for the account (L2-076.4). */
export interface SignInLocked {
  title: string;
  lockedUntil: string;
}

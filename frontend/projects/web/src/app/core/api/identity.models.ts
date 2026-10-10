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

/**
 * A customer registration (L2-023, L2-070.2). There is no role field: the
 * server creates a customer whatever else the body holds (L2-056.1).
 */
export interface RegisterRequest {
  displayName: string;
  email: string;
  password: string;
  consent: boolean;
  challengeToken: string;
}

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

/** The second step for operators: an authenticator code or a security key (L2-056.2). */
export type SecondFactorRequest = { method: 'authenticator app'; code: string } | { method: 'security key'; assertion: string };

/** What a verification link confirms (L2-077.3). 410 when the link has expired or was used. */
export interface EmailVerified {
  displayName: string;
  /** An enquiry the customer saved before verifying (L2-023.3). */
  savedEnquiry: { catererName: string; catererSlug: string; photo: string; eventDate: string; guests: number } | null;
}

/** Whose password a reset link changes. 410 when the link has expired or was used (L2-077.2). */
export interface PasswordResetLink {
  email: string;
}

export interface PasswordResetRequest {
  email: string;
  challengeToken: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/** Where the verification email went (L2-023.2). */
export interface VerificationSent {
  email: string | null;
}

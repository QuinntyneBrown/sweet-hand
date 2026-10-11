import type { LaunchRole } from './launch-role';

/** A launch list sign-up (L2-095, L2-096). `businessName` is only sent for caterers. */
export interface LaunchSignUpRequest {
  role: LaunchRole;
  email: string;
  businessName?: string;
  consent: true;
  challengeToken: string;
}

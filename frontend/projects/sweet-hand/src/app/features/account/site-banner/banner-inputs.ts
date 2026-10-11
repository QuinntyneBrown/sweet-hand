import type { SessionUser, SiteNotice } from '@sweet-hand/api';

export interface BannerInputs {
  notices: readonly SiteNotice[];
  user: SessionUser | null;
  /** The email was verified while this page was open. */
  justVerified: boolean;
  dismissed: ReadonlySet<string>;
  /** Pages that show the email conditions themselves (the account page). */
  emailShownByPage: boolean;
}

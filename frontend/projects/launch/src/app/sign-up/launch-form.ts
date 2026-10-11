import type { LaunchRole } from '@sweet-hand/api';

/** What the visitor has entered in the sign-up form. */
export interface LaunchFormValues {
  role: LaunchRole | null;
  email: string;
  businessName: string;
  consent: boolean;
}

export const emptyLaunchForm = (): LaunchFormValues => ({ role: null, email: '', businessName: '', consent: false });

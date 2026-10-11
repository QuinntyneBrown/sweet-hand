import type { OwnProfileStatus } from '@sweet-hand/api';
import { RULE_HREF } from './profile-text';

/** What the banner needs to know about the profile. */
export interface BannerProfile {
  name: string;
  status: OwnProfileStatus;
  statusReason: string | null;
  pendingName: { name: string } | null;
  attention: { key: keyof typeof RULE_HREF }[];
}

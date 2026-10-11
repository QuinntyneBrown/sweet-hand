import type { ProfileStatus } from './profile-status';

export interface DecisionResult {
  id: string;
  name: string;
  slug: string;
  status: ProfileStatus;
  owner: string;
}

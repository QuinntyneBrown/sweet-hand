import type { ProfileStatus } from './profile-status';
import type { CatererFlag } from './caterer-flag';

export interface CatererRowView {
  id: string;
  name: string;
  status: ProfileStatus;
  photo: string | null;
  cuisine: string;
  area: string;
  owner: string;
  updatedAt: string;
  flag: CatererFlag | null;
  openReports: number;
}

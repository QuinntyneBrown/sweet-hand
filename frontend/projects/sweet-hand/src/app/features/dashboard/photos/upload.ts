import type { Subscription } from 'rxjs';

export interface Upload {
  key: number;
  file: File;
  progress: number;
  subscription: Subscription | null;
}

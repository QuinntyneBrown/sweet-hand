import type { ProfileStatus } from './caterers.ts';

/** One status change (L2-046.4). Entries are only ever appended. */
export interface StatusChange {
  at: string;
  status: ProfileStatus;
  by: string;
  step: 'created' | 'submitted' | 'resubmitted' | 'approved' | 'changes-requested' | 'suspended' | 'reinstated' | 'removed';
  reason?: string;
}

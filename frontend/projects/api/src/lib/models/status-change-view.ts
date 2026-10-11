import type { ProfileStatus } from './profile-status';

/** One status change (L2-046.4); never edited afterwards. */
export interface StatusChangeView {
  at: string;
  status: ProfileStatus;
  /** Who made it, by full name. */
  by: string;
  /** What kind of step it was, for the note under it. */
  step: 'created' | 'submitted' | 'resubmitted' | 'approved' | 'changes-requested' | 'suspended' | 'reinstated' | 'removed';
  /** The operator's words, exactly as sent to the caterer. */
  reason: string | null;
}

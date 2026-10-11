import type { Problem } from '../../../../core/forms/problem';
import { profileStatusLabel } from '../moderation-text';
import { type ProfileStatus } from '@sweet-hand/api';

const STATUSES: ProfileStatus[] = ['Draft', 'Pending review', 'Changes requested', 'Published', 'Suspended', 'Removed'];

/** "Auntie Bev's Kitchen is now Draft. Nothing was changed." for a 409 (L2-046.2–3). */
export function conflictText(name: string, problem: Problem): string {
  const status = STATUSES.find((s) => s === problem['status']);
  return status
    ? $localize`:@@decision.conflictText:${name}:name: is now ${profileStatusLabel(status)}:status:. Nothing was changed.`
    : $localize`:@@decision.conflictUnknown:${name}:name: changed since you opened it. Nothing was changed.`;
}

/** At least 10 characters, as L2-048.2 requires of a change request. */
export function changeReasonError(reason: string): string | null {
  return [...reason.trim()].length < 10 ? $localize`:@@decision.reasonTooShort:Explain what the caterer needs to change` : null;
}

/** Every operator edit and action needs a reason (L2-057.4, L2-058). */
export function reasonError(reason: string): string | null {
  return reason.trim() ? null : $localize`:@@decision.reasonRequired:Add a reason for this change`;
}

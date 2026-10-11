import { randomUUID } from 'node:crypto';
import type { Document, Transaction } from '../platform/database.ts';
import { nextSequence } from '../platform/sequence.ts';
import type { ProfileStatus } from '../caterers/model.ts';
import type { ChangedField } from '@contract/changed-field.ts';
import type { ChangeValue } from '@contract/change-value.ts';

/** One status change of a caterer profile (L2-046.4). Entries are only ever appended. */
export interface StatusChange extends Document {
  catererId: string;
  at: string;
  seq: number;
  status: ProfileStatus;
  /** The user who caused it. */
  by: string;
  step: 'created' | 'submitted' | 'resubmitted' | 'approved' | 'changes-requested' | 'suspended' | 'reinstated' | 'removed';
  reason?: string;
}

/** One caterer edit to a published profile (L2-044.1), for the operators' recent-changes feed. */
export interface ProfileEdit extends Document {
  catererId: string;
  field: ChangedField;
  by: string;
  at: string;
  seq: number;
  old: ChangeValue | null;
  new: ChangeValue | null;
  reverted?: { by: string; at: string };
}

/** The profile as it was when an operator requested changes (L2-047.3), keyed by caterer id. */
export interface ProfileSnapshot extends Document {
  description: string;
  photoFiles: string[];
  dishNames: string[];
  minGuests: number;
  maxGuests: number;
  occasions: string[];
  areas: string[];
  cuisines: string[];
}

export const statusHistory = (tx: Transaction) => tx.collection<StatusChange>('statusHistory');
export const profileEdits = (tx: Transaction) => tx.collection<ProfileEdit>('profileEdits');
export const profileSnapshots = (tx: Transaction) => tx.collection<ProfileSnapshot>('profileSnapshots');

export async function recordStatusChange(tx: Transaction, now: Date, change: Omit<StatusChange, 'id' | 'at' | 'seq'>): Promise<StatusChange> {
  const doc: StatusChange = { id: `status-${randomUUID()}`, at: now.toISOString(), seq: nextSequence(), ...change };
  await statusHistory(tx).put(doc);
  return doc;
}

/** A caterer's status history, oldest first. */
export async function historyOf(tx: Transaction, catererId: string): Promise<StatusChange[]> {
  return (await statusHistory(tx).find({ catererId })).sort((a, b) => a.at.localeCompare(b.at) || a.seq - b.seq);
}

export async function recordProfileEdit(tx: Transaction, now: Date, edit: Omit<ProfileEdit, 'id' | 'at' | 'seq'>): Promise<ProfileEdit> {
  const doc: ProfileEdit = { id: `edit-${randomUUID()}`, at: now.toISOString(), seq: nextSequence(), ...edit };
  await profileEdits(tx).put(doc);
  return doc;
}

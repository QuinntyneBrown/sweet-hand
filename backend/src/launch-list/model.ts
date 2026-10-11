import type { Document, Transaction } from '../platform/database.ts';
import type { LaunchRole } from '@contract/launch-role.ts';

/** Evidence of express consent under CASL (L2-103.2); deleted with its entry. */
export interface LaunchConsent {
  /** The wording shown beside the checkbox. */
  wording: string[];
  noticeVersion: string;
  pageUrl: string;
  signedUpAt: string;
  confirmedAt?: string;
}

/** One address on the launch list (join-launch-list design). Nothing else is stored (L2-103.1). */
export interface LaunchListEntry extends Document {
  /** Trimmed, lower-cased email, so addresses differing only in case match (L2-096.7). */
  emailKey: string;
  /** Trimmed, as typed. */
  email: string;
  role: LaunchRole;
  businessName?: string;
  status: 'Pending' | 'Confirmed';
  consent: LaunchConsent;
  /** When each confirmation email was queued (L2-098.5, L2-099.5). */
  confirmationsSent: string[];
  alreadyListedSentAt?: string;
  launchEmailQueuedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** A confirmation or removal token; only its SHA-256 hash is stored (L2-104.2). */
export interface LaunchListToken extends Document {
  entryId: string;
  kind: 'confirm' | 'remove';
  tokenHash: string;
  issuedAt: string;
  consumedAt?: string;
}

/** The single `launch` document: when the launch-day email ran, which closes sign-ups (L2-102). */
export interface LaunchState extends Document {
  launchEmailRunAt?: string;
  /** Toronto date of launch day; the list is deleted 30 days later (L2-101.6). */
  launchDay?: string;
}

export const launchList = (tx: Transaction) => tx.collection<LaunchListEntry>('launchList');
export const launchListTokens = (tx: Transaction) => tx.collection<LaunchListToken>('launchListTokens');
export const launchStates = (tx: Transaction) => tx.collection<LaunchState>('launchState');

export const LAUNCH_STATE_ID = 'launch';

export async function launchState(tx: Transaction): Promise<LaunchState> {
  return (await launchStates(tx).get(LAUNCH_STATE_ID)) ?? { id: LAUNCH_STATE_ID };
}

/** Sign-ups close and confirmation links stop working once the launch-day email has run (L2-102.1, L2-102.4). */
export const launched = (state: LaunchState): boolean => !!state.launchEmailRunAt;

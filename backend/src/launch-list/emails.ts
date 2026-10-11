import type { Transaction } from '../platform/database.ts';
import { queueEmail } from '../platform/outbox.ts';
import type { LaunchListConfig } from './config.ts';
import type { LaunchListEntry } from './model.ts';
import { issueLaunchToken } from './tokens.ts';

export type LaunchEmailKind = 'launch-confirm' | 'launch-already-listed' | 'launch-day-customer' | 'launch-day-caterer';

const TORONTO_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', dateStyle: 'long' });

/**
 * The CASL identification every launch list email ends with (L2-101.4): the
 * sender, the operator's mailing address, a contact address, when the person
 * asked for it, and the removal link.
 */
export function senderFooter(entry: LaunchListEntry, removalLink: string, config: LaunchListConfig) {
  return {
    senderName: 'Sweet Hand',
    mailingAddress: config.mailingAddress,
    contactEmail: config.contactEmail,
    askedOn: TORONTO_DATE.format(new Date(entry.consent.signedUpAt)),
    removalLink,
  };
}

/**
 * Queues one launch list email with its own removal token, since a stored hash
 * cannot be turned back into a link (leave-launch-list design). The removal
 * URL rides in `List-Unsubscribe` with the RFC 8058 one-click header (L2-100.2).
 * Template fields only: the values are never written into raw headers other
 * than these two, which hold no submitted text (L2-104.7).
 */
export async function queueLaunchEmail(
  tx: Transaction,
  now: Date,
  entry: LaunchListEntry,
  kind: LaunchEmailKind,
  config: LaunchListConfig,
  extra: { link?: string } & Record<string, unknown> = {},
): Promise<void> {
  const removal = await issueLaunchToken(tx, now, entry, 'remove');
  const removalLink = `${config.siteUrl}/api/launch-list/unsubscribe?token=${removal}`;
  await queueEmail(tx, now, {
    to: entry.email,
    kind,
    ...extra,
    ...senderFooter(entry, removalLink, config),
    headers: { 'List-Unsubscribe': `<${removalLink}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  });
}

/** The confirmation email: one single-use link to the launch site that expires in 48 hours (L2-099.1). */
export async function queueConfirmation(tx: Transaction, now: Date, entry: LaunchListEntry, config: LaunchListConfig): Promise<void> {
  const confirm = await issueLaunchToken(tx, now, entry, 'confirm');
  await queueLaunchEmail(tx, now, entry, 'launch-confirm', config, { link: `${config.siteUrl}/?confirmed=${confirm}`, expiresInHours: 48 });
}

/** The launch-day email: a customer is sent to the listing, a caterer to registration (L2-101.3). */
export async function queueLaunchDay(tx: Transaction, now: Date, entry: LaunchListEntry, config: LaunchListConfig): Promise<void> {
  if (entry.role === 'caterer') {
    await queueLaunchEmail(tx, now, entry, 'launch-day-caterer', config, { link: `${config.siteUrl}/join`, mentionsFoodHandlerCertificate: true });
  } else {
    await queueLaunchEmail(tx, now, entry, 'launch-day-customer', config, { link: `${config.siteUrl}/caterers` });
  }
}

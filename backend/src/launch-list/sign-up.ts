import { randomUUID } from 'node:crypto';
import type { Request, Reply } from '../http/endpoint.ts';
import { accepted, gone, invalid } from '../http/problems.ts';
import { validChallenge } from '../platform/bot-challenge.ts';
import { hashIp } from '../platform/secrets.ts';
import { writeLog } from '../platform/log-redactor.ts';
import { currentPrivacyNotice } from '../identity/privacy.ts';
import type { LaunchListStatus } from '@contract/launch-list-status.ts';
import { launchListConfig } from './config.ts';
import { queueConfirmation, queueLaunchEmail } from './emails.ts';
import { launchList, launchState, launched, type LaunchListEntry } from './model.ts';
import { emailKey, validateSignUp } from './rules.ts';
import { throttleLaunchList } from './throttle.ts';

const DAY = 24 * 60 * 60_000;
const SIGN_UPS_PER_HOUR = 10;
const CONFIRMATIONS_PER_DAY = 3;
export const CONSENT_WORDING = ['Email me when Sweet Hand opens', 'One email, nothing else.'];

/** `GET api/public/launch-list`: whether sign-ups are open. Its reply also sets the CSRF cookie for the first submit. */
export async function launchListStatus(req: Request): Promise<Reply> {
  const status: LaunchListStatus = { open: !launched(await launchState(req.tx)) };
  return { status: 200, body: status };
}

/** The page the visitor signed up on, without any query string (L2-103.2). */
function pageUrl(req: Request, siteUrl: string): string {
  const referer = req.headers.referer;
  try {
    if (referer) {
      const url = new URL(referer);
      return `${url.origin}${url.pathname}`.slice(0, 200);
    }
  } catch {
    // Fall through to the site root.
  }
  return `${siteUrl}/`;
}

const within = (times: string[], now: Date, ms: number) => times.filter((t) => now.getTime() - Date.parse(t) < ms);

/**
 * `joinLaunchList` (join-launch-list design). Every accepted sign-up gets the
 * same 202, whatever the address's history, and emails go out from the
 * outbox, so the reply reveals nothing about who is on the list (L2-098).
 */
export async function joinLaunchList(req: Request): Promise<Reply> {
  if (launched(await launchState(req.tx))) return gone('Sign-ups have closed');
  await throttleLaunchList(req, 'launch-sign-up', SIGN_UPS_PER_HOUR);
  const body = (req.body ?? {}) as Record<string, unknown>;
  if (!validChallenge(body['challengeToken'], 'launch-sign-up')) return invalid({ challengeToken: ['Confirm you’re a person'] });
  const validation = validateSignUp(body);
  if (!validation.ok) return invalid(validation.errors);
  const { command } = validation;

  const config = launchListConfig();
  const now = req.now.toISOString();
  const key = emailKey(command.email);
  const existing = await launchList(req.tx).findOne({ emailKey: key });
  const consent = { wording: CONSENT_WORDING, noticeVersion: (await currentPrivacyNotice(req.tx)).version, pageUrl: pageUrl(req, config.siteUrl), signedUpAt: now };

  if (existing?.status === 'Confirmed') {
    // Nothing changes; at most one "already on the list" email a day (L2-098).
    if (!existing.alreadyListedSentAt || req.now.getTime() - Date.parse(existing.alreadyListedSentAt) >= DAY) {
      const entry = { ...existing, alreadyListedSentAt: now };
      await launchList(req.tx).put(entry);
      await queueLaunchEmail(req.tx, req.now, entry, 'launch-already-listed', config);
    }
    writeLog({ level: 'info', event: 'launch-sign-up', outcome: 'already-confirmed', ipHash: hashIp(req.ip) });
    return accepted({});
  }

  const { businessName: _dropped, ...rest } = existing ?? ({} as Partial<LaunchListEntry>);
  void _dropped;
  const entry: LaunchListEntry = {
    id: existing?.id ?? `lle-${randomUUID()}`,
    confirmationsSent: [],
    createdAt: now,
    ...rest,
    emailKey: key,
    email: command.email,
    role: command.role,
    ...(command.businessName ? { businessName: command.businessName } : {}),
    status: 'Pending',
    consent,
    updatedAt: now,
  };
  const recent = within(entry.confirmationsSent, req.now, DAY);
  if (recent.length < CONFIRMATIONS_PER_DAY) {
    entry.confirmationsSent = [...entry.confirmationsSent, now];
    await launchList(req.tx).put(entry);
    await queueConfirmation(req.tx, req.now, entry, config);
  } else {
    await launchList(req.tx).put(entry);
  }
  writeLog({ level: 'info', event: 'launch-sign-up', outcome: existing ? 'pending' : 'new', ipHash: hashIp(req.ip) });
  return accepted({});
}

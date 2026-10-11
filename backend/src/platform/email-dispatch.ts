import type { Environment } from '../environment.ts';
import { outbox, type OutboxEmail } from './outbox.ts';
import { hashIp } from './secrets.ts';
import { writeLog } from './log-redactor.ts';

/** Hands one email to the provider; throws when it could not be sent. The provider is `<TO SUPPLY>`. */
export interface EmailGateway {
  send(email: OutboxEmail): Promise<void>;
}

/** Until a provider is chosen: logs that the email would go out, without the address or link (L2-084.2). */
export const logGateway: EmailGateway = {
  send: async (email) => writeLog({ level: 'info', event: 'email-sent', kind: email.kind, toHash: hashIp(email.to), id: email.id }),
};

/** The provider refused the email for good (a hard bounce or rejected address): it is not retried (L2-101.5). */
export class PermanentFailure extends Error {}

/** The provider's rate limit per tick; `<TO SUPPLY>` with the provider, unlimited until then (L2-101.5). */
const MAX_PER_TICK = Number(process.env['EMAILS_PER_TICK'] ?? 0) || Infinity;

const MINUTE = 60_000;
/** Retries back off exponentially from one minute, capped at an hour, for up to 24 hours (L2-030.2). */
const GIVE_UP_AFTER_MS = 24 * 60 * MINUTE;
const backoff = (attempts: number) => Math.min(MINUTE * 2 ** (attempts - 1), 60 * MINUTE);

const CLAIM_TIMEOUT_MS = 10 * MINUTE;
const due = (email: OutboxEmail, now: Date) =>
  (email.status === 'queued' && (!email.nextAttemptAt || Date.parse(email.nextAttemptAt as string) <= now.getTime())) ||
  (email.status === 'sending' && typeof email.processingStartedAt === 'string' && Date.parse(email.processingStartedAt) <= now.getTime() - CLAIM_TIMEOUT_MS);

/**
 * Sends every queued email that is due (notify-enquiry-activity design). Sent
 * emails drop their link, which may hold a token. An email still failing 24
 * hours after it was queued becomes `failed` and raises an operator alert.
 */
export async function dispatchDueEmails(
  env: Environment,
  gateway: EmailGateway,
  alert: (message: string) => void = (m) => writeLog({ level: 'alert', message: m }),
  options: { maxPerTick?: number } = {},
): Promise<number> {
  const now = env.clock.now();
  const limit = options.maxPerTick ?? MAX_PER_TICK;
  const queued = await env.db.transaction(async (tx) => (await outbox(tx).all()).filter((e) => due(e, now)));
  const pending = queued.sort((a, b) => a.seq - b.seq).slice(0, limit);
  let sent = 0;
  for (const email of pending) {
    const claimed = await env.db.transaction(async (tx) => {
      const current = await outbox(tx).get(email.id);
      if (!current || !due(current, now)) return false;
      await outbox(tx).put({ ...current, status: 'sending', processingStartedAt: now.toISOString() });
      return true;
    });
    if (!claimed) continue;
    let failure: unknown;
    try {
      await gateway.send(email);
    } catch (err) {
      failure = err;
    }
    await env.db.transaction(async (tx) => {
      const current = await outbox(tx).get(email.id);
      if (!current || current.status !== 'sending') return;
      if (!failure) {
        // Each link, and the List-Unsubscribe header, may hold a token.
        const { link: _link, removalLink: _removal, headers: _headers, ...rest } = current;
        void _link;
        void _removal;
        void _headers;
        // Mail to a deleted account keeps no address once sent (L2-072).
        await outbox(tx).put({ ...rest, ...(rest.forgetRecipient ? { to: '' } : {}), status: 'sent', sentAt: now.toISOString() });
        sent++;
        return;
      }
      const attempts = ((current.attempts as number | undefined) ?? 0) + 1;
      if (failure instanceof PermanentFailure) {
        await outbox(tx).put({ ...current, ...(current.forgetRecipient ? { to: '' } : {}), attempts, status: 'failed', failedAt: now.toISOString() });
        return;
      }
      if (now.getTime() - Date.parse(current.at) >= GIVE_UP_AFTER_MS) {
        await outbox(tx).put({ ...current, ...(current.forgetRecipient ? { to: '' } : {}), attempts, status: 'failed', failedAt: now.toISOString() });
        alert(`Email ${current.id} (${current.kind}) failed for 24 hours and was given up`);
        return;
      }
        const { processingStartedAt: _processing, ...rest } = current;
        void _processing;
        await outbox(tx).put({ ...rest, status: 'queued', attempts, nextAttemptAt: new Date(now.getTime() + backoff(attempts)).toISOString() });
    });
  }
  return sent;
}

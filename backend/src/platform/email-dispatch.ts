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

const MINUTE = 60_000;
/** Retries back off exponentially from one minute, capped at an hour, for up to 24 hours (L2-030.2). */
const GIVE_UP_AFTER_MS = 24 * 60 * MINUTE;
const backoff = (attempts: number) => Math.min(MINUTE * 2 ** (attempts - 1), 60 * MINUTE);

const due = (email: OutboxEmail, now: Date) => email.status === 'queued' && (!email.nextAttemptAt || Date.parse(email.nextAttemptAt as string) <= now.getTime());

/**
 * Sends every queued email that is due (notify-enquiry-activity design). Sent
 * emails drop their link, which may hold a token. An email still failing 24
 * hours after it was queued becomes `failed` and raises an operator alert.
 */
export async function dispatchDueEmails(env: Environment, gateway: EmailGateway, alert: (message: string) => void = (m) => writeLog({ level: 'alert', message: m })): Promise<number> {
  const now = env.clock.now();
  const pending = await env.db.transaction(async (tx) => (await outbox(tx).find({ status: 'queued' })).filter((e) => due(e, now)));
  let sent = 0;
  for (const email of pending) {
    let failure: unknown;
    try {
      await gateway.send(email);
    } catch (err) {
      failure = err;
    }
    await env.db.transaction(async (tx) => {
      const current = await outbox(tx).get(email.id);
      if (!current || current.status !== 'queued') return;
      if (!failure) {
        const { link: _link, ...rest } = current;
        void _link;
        await outbox(tx).put({ ...rest, status: 'sent', sentAt: now.toISOString() });
        sent++;
        return;
      }
      const attempts = ((current.attempts as number | undefined) ?? 0) + 1;
      if (now.getTime() - Date.parse(current.at) >= GIVE_UP_AFTER_MS) {
        await outbox(tx).put({ ...current, attempts, status: 'failed', failedAt: now.toISOString() });
        alert(`Email ${current.id} (${current.kind}) failed for 24 hours and was given up`);
        return;
      }
      await outbox(tx).put({ ...current, attempts, nextAttemptAt: new Date(now.getTime() + backoff(attempts)).toISOString() });
    });
  }
  return sent;
}

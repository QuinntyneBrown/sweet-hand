import { randomUUID } from 'node:crypto';
import type { Environment } from '../environment.ts';
import { torontoDate } from '../discovery/listing.ts';
import { enquiries, type Enquiry } from './model.ts';

const BATCH = 100;

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Open or Replied, and today (Toronto) is at least 30 days after the event (IsDueForAutoClose, L2-033.4). */
export const isDueForAutoClose = (e: Enquiry, today: string): boolean =>
  (e.status === 'Open' || e.status === 'Replied') && addDays(e.eventDate, 30) <= today;

/**
 * Closes stale enquiries by the system (AutoCloseEnquiriesHandler, L2-033.4),
 * in batches: a failure in one batch leaves the others committed.
 */
export async function autoCloseEnquiries(env: Environment): Promise<number> {
  const now = env.clock.now();
  const today = torontoDate(now);
  const due = await env.db.transaction(async (tx) => (await enquiries(tx).all()).filter((e) => isDueForAutoClose(e, today)).map((e) => e.id));
  let closed = 0;
  for (let i = 0; i < due.length; i += BATCH) {
    closed += await env.db.transaction(async (tx) => {
      let n = 0;
      for (const id of due.slice(i, i + BATCH)) {
        const e = await enquiries(tx).get(id);
        if (!e || !isDueForAutoClose(e, today)) continue;
        await enquiries(tx).put({ ...e, status: 'Closed', events: [...e.events, { id: randomUUID(), kind: 'closed', by: 'system', at: now.toISOString() }] });
        n++;
      }
      return n;
    });
  }
  return closed;
}

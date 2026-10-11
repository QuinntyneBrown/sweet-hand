import { randomUUID } from 'node:crypto';
import type { Request, Reply } from '../http/router.ts';
import { conflict, fail, forbidden, invalid, notFound, ok } from '../http/problems.ts';
import { mailServiceStatus } from '../platform/mail-service.ts';
import { currentUser } from '../identity/sessions.ts';
import type { Party } from '@contract/party.ts';
import type { ReplyResult } from '@contract/reply-result.ts';
import type { User } from '../identity/model.ts';
import { enquiries, type Enquiry } from './model.ts';
import { appendEvent, isActive, markRead, partyOf } from './rules.ts';
import { partiesOf, threadView } from './views.ts';
import { notifyDeclined, notifyReply } from './notifications.ts';

export interface PartyThread {
  user: User;
  e: Enquiry;
  party: Party;
}

const REPLY_MAX = 2000;
/** Characters, not UTF-16 code units. */
export const length = (s: string) => [...s].length;
export const text = (v: unknown) => (typeof v === 'string' ? v : '');

/**
 * The caller's enquiry and their side of it. Anyone who is not one of its two
 * parties gets the same 404 as for an id that does not exist (L2-034.1).
 */
export async function loadThread(req: Request): Promise<PartyThread> {
  const user = currentUser(req);
  const e = await enquiries(req.tx).get(req.params['id']);
  const party = e ? partyOf(user, e) : null;
  if (!e || !party) return fail(notFound());
  return { user, e, party };
}

/** GET /api/enquiries/:id: the thread; opening it marks it read unless `markRead=false` (the caterer's preview pane). */
export async function openThread(req: Request): Promise<Reply> {
  const { e, party } = await loadThread(req);
  if (req.query.get('markRead') !== 'false') {
    markRead(e, party, req.now);
    await enquiries(req.tx).put(e);
  }
  return ok(await threadView(req.tx, e, party, req.now));
}

/** POST /api/enquiries/:id/messages: a reply of 1 to 2,000 characters while the thread is active (L2-032.2, L2-033.5). */
export async function postReply(req: Request): Promise<Reply> {
  const { e, party } = await loadThread(req);
  if (!isActive(e)) return conflict('This enquiry is closed', { status: e.status });
  const parties = await partiesOf(req.tx, e);
  if (party === 'caterer' && !parties.customer) return conflict('This person has left Sweet Hand');
  const body = text(req.body?.text);
  if (!body.trim()) return invalid({ reply: ['Write a reply before sending'] });
  if (length(body) > REPLY_MAX) return invalid({ reply: ['Keep your reply under 2,000 characters'] });

  const ev = appendEvent(e, req.now, randomUUID(), { kind: 'reply', by: party, text: body });
  // The caterer's first reply moves an Open enquiry to Replied (L2-033.1).
  if (party === 'caterer' && e.status === 'Open') e.status = 'Replied';
  markRead(e, party, req.now);
  await enquiries(req.tx).put(e);
  await notifyReply(req.tx, req.now, e, parties, party, body);
  const result: ReplyResult = {
    entry: { kind: 'reply', id: ev.id, from: party, text: body, at: ev.at },
    status: e.status,
    emailDelayed: (await mailServiceStatus(req.tx)) !== 'up',
  };
  return ok(result, 201);
}

const NOTE_MAX = 500;

/** POST /api/enquiries/:id/decline: only the caterer, only while Open, with an optional note of up to 500 characters (L2-033.2, L2-033.3). */
export async function declineEnquiry(req: Request): Promise<Reply> {
  const { e, party } = await loadThread(req);
  if (party !== 'caterer') return forbidden();
  const note = text(req.body?.note).trim();
  if (length(note) > NOTE_MAX) return invalid({ note: ['Keep your note under 500 characters'] });
  if (e.status !== 'Open') return conflict('Only an open enquiry can be declined', { status: e.status });
  e.status = 'Declined';
  appendEvent(e, req.now, randomUUID(), { kind: 'declined', by: 'caterer', note: note || null });
  markRead(e, party, req.now);
  await enquiries(req.tx).put(e);
  await notifyDeclined(req.tx, req.now, e, await partiesOf(req.tx, e), note || null);
  return ok(await threadView(req.tx, e, party, req.now));
}

/** POST /api/enquiries/:id/contact-shares: reveals the caller's own contact details to the other party in this thread only (L2-035). */
export async function shareContact(req: Request): Promise<Reply> {
  const { e, party } = await loadThread(req);
  if (!isActive(e)) return conflict('This enquiry is closed', { status: e.status });
  if (!e.events.some((ev) => ev.kind === 'shared' && ev.by === party)) appendEvent(e, req.now, randomUUID(), { kind: 'shared', by: party });
  markRead(e, party, req.now);
  await enquiries(req.tx).put(e);
  return ok(await threadView(req.tx, e, party, req.now));
}

/** POST /api/enquiries/:id/close:either party closes an Open or Replied enquiry (L2-033). */
export async function closeEnquiry(req: Request): Promise<Reply> {
  const { e, party } = await loadThread(req);
  if (!isActive(e)) return conflict('This enquiry is already closed', { status: e.status });
  e.status = 'Closed';
  appendEvent(e, req.now, randomUUID(), { kind: 'closed', by: party });
  markRead(e, party, req.now);
  await enquiries(req.tx).put(e);
  return ok(await threadView(req.tx, e, party, req.now));
}

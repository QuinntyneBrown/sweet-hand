import type { Request, Reply } from '../http/router.ts';
import { fail, notFound, ok } from '../http/problems.ts';
import { currentUser } from '../identity/sessions.ts';
import type { Party } from '@contract/party.ts';
import type { User } from '../identity/model.ts';
import { enquiries, type Enquiry } from './model.ts';
import { markRead, partyOf } from './rules.ts';
import { threadView } from './views.ts';

export interface PartyThread {
  user: User;
  e: Enquiry;
  party: Party;
}

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

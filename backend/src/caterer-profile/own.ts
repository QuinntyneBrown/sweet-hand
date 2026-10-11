import type { Request } from '../http/router.ts';
import { conflict, fail, notFound } from '../http/problems.ts';
import { caterers, type Caterer } from '../caterers/model.ts';
import { liveUser, type User } from '../identity/model.ts';

/** The caller and the profile they own. */
export interface Own {
  user: User;
  caterer: Caterer;
}

/**
 * The session's own caterer profile, never one named in the request (L2-079.1).
 * The route policy already admits only caterers.
 */
export async function loadOwn(req: Request): Promise<Own> {
  const user = await liveUser(req.tx, req.actor?.userId);
  const caterer = user?.catererId ? await caterers(req.tx).get(user.catererId) : undefined;
  if (!user || !caterer) return fail(notFound());
  return { user, caterer };
}

/** Draft and Changes requested are edited freely, Published edits go live; nothing else changes (set-up-profile design). */
export function assertEditable(c: Caterer): void {
  if (c.status === 'Draft' || c.status === 'Changes requested' || c.status === 'Published') return;
  fail(conflict('Your profile can’t be changed right now', { status: c.status }));
}

/** The certificate stays editable while suspended, so a caterer can bring it up to date (provide-food-handler-certificate design). */
export function assertCertificateEditable(c: Caterer): void {
  if (c.status === 'Pending review' || c.status === 'Removed') fail(conflict('Your profile can’t be changed right now', { status: c.status }));
}

export const saveCaterer = (req: Request, c: Caterer) => caterers(req.tx).put(c);

/** Trimmed text of a body field; anything but a string is empty. */
export const text = (s: unknown): string => (typeof s === 'string' ? s.trim() : '');

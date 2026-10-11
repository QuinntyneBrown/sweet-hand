import type { Request } from '../http/endpoint.ts';
import { conflict, fail, notFound } from '../http/problems.ts';
import { caterers, type Caterer } from '../caterers/model.ts';
import { liveUser, type User } from '../identity/model.ts';
import { settleProcessing } from './processing.ts';

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
  // Photos still processing are finished as soon as the image service is back (L2-091.2).
  if (await settleProcessing(req.env, caterer)) await caterers(req.tx).put(caterer);
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

export const saveCaterer = (req: Request, c: Caterer) => {
  // A replacement deadline is met once the profile is back at its minimum (L2-057.2).
  if (c.attention?.some((a) => a.replaceBy)) {
    const met = (key: string) => (key === 'photos' ? c.photos.length >= 3 : key === 'menu' ? c.dishes.length >= 3 : false);
    c.attention = c.attention.filter((a) => !a.replaceBy || !met(a.key));
    if (!c.attention.length) delete c.attention;
  }
  return caterers(req.tx).put(c);
};

/** Trimmed text of a body field; anything but a string is empty. */
export const text = (s: unknown): string => (typeof s === 'string' ? s.trim() : '');

/** `items` in the order of `ids`, when `ids` names every item exactly once; otherwise undefined. */
export function reorder<T extends { id: string }>(items: T[], ids: unknown): T[] | undefined {
  if (!Array.isArray(ids) || ids.length !== items.length || new Set(ids).size !== ids.length) return undefined;
  const out = ids.map((id) => items.find((x) => x.id === id));
  return out.every((x): x is T => !!x) ? out : undefined;
}

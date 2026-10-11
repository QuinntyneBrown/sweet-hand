import type { Request, Reply } from '../http/endpoint.ts';
import { invalid, noContent } from '../http/problems.ts';
import { outbox, queueEmail } from '../platform/outbox.ts';
import { enquiryDrafts } from '../enquiries/drafts.ts';
import { removedPhotos } from '../caterer-profile/model.ts';
import { discardPhotoMedia } from '../caterer-profile/processing.ts';
import { verifyPassword } from '../platform/secrets.ts';
import type { DeleteAccountRequest } from '@contract/delete-account-request.ts';
import { caterers, type Caterer } from '../caterers/model.ts';
import { enquiries, type Enquiry } from '../enquiries/model.ts';
import { reviews } from '../reviews/model.ts';
import { accountTokens, liveUser, users, type User } from '../identity/model.ts';
import { clearSessionCookie, currentUser, endSessionsOf } from '../identity/sessions.ts';
import { recordFailure } from '../identity/sign-in.ts';
import { savedEnquiries } from '../identity/verification.ts';
import { consents } from '../identity/privacy.ts';
import { isOpenEnquiry } from './account-view.ts';
import { dataExports } from './model.ts';

/** What a deleted person is called wherever their content stays (L2-072.2). */
export const FORMER_USER = 'Former Sweet Hand user';

/**
 * Removes contact details the person shared in their threads; the messages
 * stay for the other party, no longer linked to anyone who can sign in (L2-072.2).
 */
function withoutSharedContact(e: Enquiry, party: 'customer' | 'caterer'): Enquiry {
  return { ...e, events: e.events.map((ev) => (ev.kind === 'shared' && ev.by === party ? { id: ev.id, kind: ev.kind, by: ev.by, at: ev.at } : ev)) };
}

/** A customer's reviews go and the caterers' averages follow, since they are computed from published reviews (L2-072.3). */
async function processCustomer(req: Request, user: User): Promise<void> {
  for (const r of await reviews(req.tx).find({ authorUserId: user.id })) await reviews(req.tx).delete(r.id);
  for (const e of await enquiries(req.tx).find({ customerId: user.id })) await enquiries(req.tx).put(withoutSharedContact(e, 'customer'));
}

/**
 * A caterer's profile leaves public view, its menu, photos and certificate go,
 * its reviews and responses are removed, and each open enquiry is closed with
 * an email to the customer (L2-072.4). Returns the media to delete.
 */
async function processCaterer(req: Request, profile: Caterer): Promise<string[]> {
  const now = req.now.toISOString();
  for (const e of await enquiries(req.tx).find({ catererId: profile.id })) {
    let next = withoutSharedContact(e, 'caterer');
    if (isOpenEnquiry(e)) {
      next = { ...next, status: 'Closed', events: [...next.events, { id: `${e.id}-closed-${req.now.getTime()}`, kind: 'closed', by: 'caterer', at: now }] };
      const customer = await liveUser(req.tx, e.customerId);
      if (customer) await queueEmail(req.tx, req.now, { to: customer.email, kind: 'enquiry-closed', enquiryId: e.id, link: `/inbox/${e.id}` });
    }
    await enquiries(req.tx).put(next);
  }
  for (const r of await reviews(req.tx).find({ catererId: profile.id })) await reviews(req.tx).delete(r.id);
  // Photos waiting behind Undo, pending replacements and the certificate go too.
  const removed = await removedPhotos(req.tx).find({ catererId: profile.id });
  for (const r of removed) await removedPhotos(req.tx).delete(r.id);
  const photos = [...profile.photos, ...removed.map((r) => r.photo)];
  for (const p of photos) if (p.pendingFile) await discardPhotoMedia(req, p.pendingFile);
  const files = [...photos.map((p) => p.file), ...(profile.certificate?.fileMediaId ? [profile.certificate.fileMediaId] : [])];
  await caterers(req.tx).put({
    ...profile,
    status: 'Removed',
    statusReason: 'The owner deleted their account',
    statusChangedAt: now,
    ownerUserId: undefined,
    photos: [],
    dishes: [],
    certificate: undefined,
    businessEmail: undefined,
    businessPhone: undefined,
    pendingName: undefined,
    attention: undefined,
  });
  // A file another profile still shows is not this caterer's to delete.
  const stillUsed = new Set((await caterers(req.tx).all()).filter((c) => c.id !== profile.id).flatMap((c) => c.photos.map((p) => p.file)));
  return files.filter((f) => !stillUsed.has(f));
}

/**
 * Closes the account after the password is confirmed (delete-account design):
 * every session ends, a confirmation is emailed, and the person's details are
 * deleted or anonymised at once, well within the 30 days of L2-072. A wrong
 * password changes nothing and counts toward the sign-in pause (L2-076.4).
 */
export async function deleteAccount(req: Request): Promise<Reply> {
  const user = currentUser(req);
  const body = (req.body ?? {}) as Partial<DeleteAccountRequest>;
  const password = typeof body.password === 'string' ? body.password : '';
  if (!(await verifyPassword(user.passwordHash, password))) {
    await recordFailure(req, user);
    return invalid({ password: ['That password isn’t right'] });
  }

  await processDeletion(req, user);
  clearSessionCookie(req);
  return noContent();
}

/**
 * The deletion processing (ProcessAccountDeletionJob, AccountDeletionPolicy),
 * shared by self-deletion and the inactive-account retention rule (L2-072,
 * L2-073.2). Every email already sent to the address forgets it; the
 * confirmation and anything still queued forget it once sent.
 */
export async function processDeletion(req: Request, user: User): Promise<void> {
  for (const m of await outbox(req.tx).find({ to: user.email })) {
    await outbox(req.tx).put(m.status === 'queued' ? { ...m, forgetRecipient: true } : { ...m, to: '' });
  }
  await queueEmail(req.tx, req.now, { to: user.email, kind: 'account-deleted', forgetRecipient: true });
  const profile = user.catererId ? await caterers(req.tx).get(user.catererId) : undefined;
  const files = profile ? await processCaterer(req, profile) : [];
  if (!profile) await processCustomer(req, user);

  await endSessionsOf(req, user.id);
  for (const t of await accountTokens(req.tx).find({ userId: user.id })) await accountTokens(req.tx).delete(t.id);
  for (const x of await dataExports(req.tx).find({ userId: user.id })) await dataExports(req.tx).delete(x.id);
  await savedEnquiries(req.tx).delete(user.id);
  for (const c of await consents(req.tx).find({ userId: user.id })) await consents(req.tx).delete(c.id);
  await users(req.tx).put({
    id: user.id,
    role: user.role,
    displayName: FORMER_USER,
    email: '',
    emailKey: '',
    passwordHash: '',
    passwordChangedAt: user.passwordChangedAt,
    emailVerified: false,
    createdAt: user.createdAt,
    acceptedPrivacyVersion: '',
    acceptedPrivacyAt: '',
    deleted: true,
    deletedAt: req.now.toISOString(),
  });
  for (const d of await enquiryDrafts(req.tx).find({ userId: user.id })) await enquiryDrafts(req.tx).delete(d.id);
  for (const f of files) {
    await discardPhotoMedia(req, f);
    await req.env.media.delete(f);
  }
}

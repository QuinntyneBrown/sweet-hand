/** Unsent enquiry values kept for 24 hours (send-enquiry design, `EnquiryDraft`; L2-023.3). */
import type { Request, Reply } from '../http/router.ts';
import { noContent, notFound, ok } from '../http/problems.ts';
import type { Document, Transaction } from '../platform/database.ts';
import type { EnquiryDraftView } from '@contract/enquiry-draft-view.ts';
import type { EnquiryFormValues } from '@contract/enquiry-form-values.ts';
import { customerOnly, formValues, isReply, publishedCaterer } from './form.ts';
import type { Caterer } from '../caterers/model.ts';
import type { User } from '../identity/model.ts';
import { savedEnquiries } from '../identity/verification.ts';

export interface EnquiryDraft extends Document {
  userId: string;
  catererId: string;
  values: EnquiryFormValues;
  savedAt: string;
}

export const enquiryDrafts = (tx: Transaction) => tx.collection<EnquiryDraft>('enquiryDrafts');
export const draftId = (user: Pick<User, 'id'>, caterer: Pick<Caterer, 'id'>) => `${user.id}:${caterer.id}`;

const DAY_MS = 24 * 3_600_000;

/** GET /api/enquiries/drafts/:caterer: the customer's unsent values for one caterer, kept for 24 hours; 204 when there are none. */
export async function getDraft(req: Request): Promise<Reply> {
  const user = customerOnly(req);
  if (isReply(user)) return user;
  const caterer = await publishedCaterer(req.tx, req.params['caterer']);
  const draft = caterer && (await enquiryDrafts(req.tx).get(draftId(user, caterer)));
  if (!draft) return noContent();
  if (req.now.getTime() - Date.parse(draft.savedAt) > DAY_MS) {
    await enquiryDrafts(req.tx).delete(draft.id);
    return noContent();
  }
  const view: EnquiryDraftView = { values: draft.values, savedAt: draft.savedAt };
  return ok(view);
}

/**
 * PUT /api/enquiries/drafts/:caterer: keeps what the customer typed. For a
 * customer still verifying their email it is also what the verification page
 * offers to finish (L2-023.3).
 */
export async function saveDraft(req: Request): Promise<Reply> {
  const user = customerOnly(req);
  if (isReply(user)) return user;
  const caterer = await publishedCaterer(req.tx, req.params['caterer']);
  if (!caterer) return notFound();
  const values = formValues(req.body);
  const savedAt = req.now.toISOString();
  await enquiryDrafts(req.tx).put({ id: draftId(user, caterer), userId: user.id, catererId: caterer.id, values, savedAt });
  if (!user.emailVerified) {
    const guests = /^\d+$/.test(values.guests.trim()) ? Number(values.guests.trim()) : 0;
    await savedEnquiries(req.tx).put({ id: user.id, catererSlug: caterer.slug, eventDate: values.eventDate, guests });
  }
  return noContent();
}

/** Once the enquiry is sent its draft, and the copy the verification page shows, are gone. */
export async function forgetDraft(tx: Transaction, user: User, caterer: Caterer): Promise<void> {
  await enquiryDrafts(tx).delete(draftId(user, caterer));
  const saved = await savedEnquiries(tx).get(user.id);
  if (saved?.catererSlug === caterer.slug) await savedEnquiries(tx).delete(user.id);
}

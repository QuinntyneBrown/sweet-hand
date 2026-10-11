/** Unsent enquiry values kept for 24 hours (send-enquiry design, `EnquiryDraft`; L2-023.3). */
import type { Document, Transaction } from '../platform/database.ts';
import type { EnquiryFormValues } from '@contract/enquiry-form-values.ts';
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

/** Once the enquiry is sent its draft, and the copy the verification page shows, are gone. */
export async function forgetDraft(tx: Transaction, user: User, caterer: Caterer): Promise<void> {
  await enquiryDrafts(tx).delete(draftId(user, caterer));
  const saved = await savedEnquiries(tx).get(user.id);
  if (saved?.catererSlug === caterer.slug) await savedEnquiries(tx).delete(user.id);
}

/** What the enquiry form sends, read field by field, and who may send it (send-enquiry design). */
import type { Request, Reply } from '../http/endpoint.ts';
import { problem } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import type { EnquiryFormValues } from '@contract/enquiry-form-values.ts';
import type { EnquiryRefusal } from '@contract/enquiry-refusal.ts';
import { caterers } from '../caterers/model.ts';
import type { User } from '../identity/model.ts';
import { currentUser } from '../identity/sessions.ts';

export const text = (v: unknown) => (typeof v === 'string' ? v : '');
/** Characters, not UTF-16 code units. */
export const length = (s: string) => [...s].length;

/** What the form holds, field by field; anything else in the body is ignored. */
export function formValues(body: Record<string, unknown> | undefined): EnquiryFormValues {
  const b = body ?? {};
  return {
    eventDate: text(b['eventDate']),
    guests: b['guests'] === undefined || b['guests'] === null ? '' : String(b['guests']),
    area: text(b['area']),
    postalCode: text(b['postalCode']),
    occasion: text(b['occasion']),
    message: text(b['message']),
  };
}

/** A refusal the form words itself, from `code` (EnquiryRefusal). */
export function refuse(status: number, code: EnquiryRefusal, title: string, extra: Record<string, unknown> = {}, headers?: Record<string, string>): Reply {
  return { ...problem(status, title, { code, ...extra }), headers };
}

/** The signed-in customer, or the refusal for any other role (L2-023.4). */
export function customerOnly(req: Request): User | Reply {
  const user = currentUser(req);
  if (user.role !== 'Customer') return refuse(403, 'customer-only', 'Sign in with a customer account to send enquiries');
  return user;
}

export const isReply = (x: User | Reply): x is Reply => typeof (x as Reply).status === 'number';

export const publishedCaterer = (tx: Transaction, slug: unknown) =>
  typeof slug === 'string' ? caterers(tx).findOne({ slug, status: 'Published' }) : Promise.resolve(undefined);

import type { Request, Reply } from '../http/endpoint.ts';
import { ok } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import type { AccountView } from '@contract/account-view.ts';
import { caterers } from '../caterers/model.ts';
import { enquiries, type Enquiry } from '../enquiries/model.ts';
import { reports } from '../reports/model.ts';
import { reviews } from '../reviews/model.ts';
import { liveUser, type User } from '../identity/model.ts';
import { currentUser } from '../identity/sessions.ts';
import { dataExports } from './model.ts';

/** Enquiries the caterer has not finished with: closing them tells the customer (L2-072.4). */
export const isOpenEnquiry = (e: Enquiry): boolean => e.status === 'Open' || e.status === 'Replied';

/** The caterer's open enquiries, newest first. */
export async function openEnquiriesOf(tx: Transaction, catererId: string): Promise<Enquiry[]> {
  return (await enquiries(tx).find({ catererId })).filter(isOpenEnquiry).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** What an export holds and what deletion removes, counted from the records themselves (L2-071, L2-072). */
async function dataSummary(tx: Transaction, user: User) {
  const business = user.catererId ? await caterers(tx).get(user.catererId) : undefined;
  if (business) {
    const own = (await reviews(tx).find({ catererId: business.id })).filter((r) => r.status !== 'Removed');
    const open = await openEnquiriesOf(tx, business.id);
    const customersToTell: string[] = [];
    for (const e of open) {
      const customer = await liveUser(tx, e.customerId);
      if (customer) customersToTell.push(customer.displayName.split(' ')[0]);
    }
    return {
      business,
      exportContents: {
        enquiries: (await enquiries(tx).find({ catererId: business.id })).length,
        reviews: own.length,
        reports: (await reports(tx).find({ reporterUserId: user.id })).length,
        photos: business.photos.length,
        dishes: business.dishes.length,
        reviewResponses: own.filter((r) => r.response).length,
      },
      deletion: { reviews: own.length, openEnquiries: open.length, customersToTell },
    };
  }
  const written = (await reviews(tx).find({ authorUserId: user.id })).filter((r) => r.status !== 'Removed');
  return {
    business: undefined,
    exportContents: {
      enquiries: (await enquiries(tx).find({ customerId: user.id })).length,
      reviews: written.length,
      reports: (await reports(tx).find({ reporterUserId: user.id })).length,
      photos: 0,
      dishes: 0,
      reviewResponses: 0,
    },
    deletion: { reviews: written.length, openEnquiries: 0, customersToTell: [] },
  };
}

/** The latest export still being prepared, if any (L2-071). */
async function pendingExport(tx: Transaction, user: User) {
  return (await dataExports(tx).find({ userId: user.id, status: 'Requested' })).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))[0];
}

export async function accountViewOf(tx: Transaction, user: User): Promise<AccountView> {
  const summary = await dataSummary(tx, user);
  const requested = await pendingExport(tx, user);
  return {
    role: user.role,
    displayName: user.displayName,
    email: user.email,
    emailVerified: user.emailVerified,
    verificationSentAt: user.verificationSentAt ?? null,
    emailBounced: !!user.emailBounced,
    phone: user.phone ?? null,
    memberSince: user.createdAt,
    passwordChangedAt: user.passwordChangedAt,
    privacy: { version: user.acceptedPrivacyVersion, acceptedAt: user.acceptedPrivacyAt },
    business: summary.business ? { name: summary.business.name } : null,
    dataExport: requested ? { requestedAt: requested.requestedAt } : null,
    exportContents: summary.exportContents,
    deletion: summary.deletion,
  };
}

/** GET /api/me/account: the signed-in person's own account page. */
export async function accountView(req: Request): Promise<Reply> {
  return ok(await accountViewOf(req.tx, currentUser(req)));
}

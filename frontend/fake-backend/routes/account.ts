import type { Router } from '../lib/router.ts';
import { invalid, ok, unauthorized, type Ctx, type Reply } from '../lib/http.ts';
import { currentUser, type Store } from '../lib/store.ts';
import type { User } from '../seed/users.ts';
import type { AccountView, ActiveSession, UpdateDetailsRequest } from '../../projects/web/src/app/core/api/account.models.ts';
import { findUser, identityScenarios, sendVerification } from './identity.ts';
import { sessionRecord } from './session.ts';

const EMPTY_SUMMARY = { enquiries: 0, reviews: 0, reports: 0, photos: 0, dishes: 0, reviewResponses: 0, openEnquiriesWith: [] as string[] };

export function accountView(store: Store, user: User): AccountView {
  const summary = store.account.dataSummaries[user.id] ?? EMPTY_SUMMARY;
  const business = user.catererId ? store.caterers.find((c) => c.id === user.catererId) : undefined;
  const requestedAt = store.account.dataExports[user.id];
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
    business: business ? { name: business.name } : null,
    dataExport: requestedAt ? { requestedAt } : null,
    exportContents: {
      enquiries: summary.enquiries,
      reviews: summary.reviews,
      reports: summary.reports,
      photos: summary.photos,
      dishes: summary.dishes,
      reviewResponses: summary.reviewResponses,
    },
    deletion: { reviews: summary.reviews, openEnquiries: summary.openEnquiriesWith.length, customersToTell: summary.openEnquiriesWith },
  };
}

/** The signed-in user and their session cookie, or a 401 reply. */
export function signedIn(ctx: Ctx<Store>): { user: User; token: string } | Reply {
  const user = currentUser(ctx.store, ctx.cookies);
  return user ? { user, token: ctx.cookies['sh_session'] ?? '' } : unauthorized();
}

const isReply = (v: unknown): v is Reply => typeof (v as Reply).status === 'number';

/** Fake endpoints of the account area (manage-sessions, export-personal-data, delete-account). */
export function registerAccount(r: Router<Store>): void {
  r.get('/api/me/account', (ctx): Reply => {
    const me = signedIn(ctx);
    if (isReply(me)) return me;
    return ok(accountView(ctx.store, me.user));
  });

  /** Name, email and phone; a new email must be verified again (L2-077.3). */
  r.put('/api/me/details', (ctx): Reply => {
    const me = signedIn(ctx);
    if (isReply(me)) return me;
    const body = (ctx.body ?? {}) as Partial<UpdateDetailsRequest>;
    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const errors: Record<string, string[]> = {};
    if ([...displayName].length < 2 || [...displayName].length > 50) errors['name'] = ['Enter a display name of 2 to 50 characters'];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors['email'] = ['Enter an email address like name@example.com'];
    else if (email.toLowerCase() !== me.user.email.toLowerCase() && findUser(ctx.store, email)) errors['email'] = ['Use a different email address'];
    if (Object.keys(errors).length) return invalid(errors);
    const emailChanged = email.toLowerCase() !== me.user.email.toLowerCase();
    me.user.displayName = displayName;
    me.user.email = email;
    me.user.phone = typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : undefined;
    if (emailChanged) {
      me.user.emailVerified = false;
      me.user.emailBounced = false;
      sendVerification(ctx.store, me.user);
    }
    return ok(accountView(ctx.store, me.user));
  });

  /** The caller's own sessions only (L2-078.5). */
  r.get('/api/me/sessions', (ctx): Reply => {
    const me = signedIn(ctx);
    if (isReply(me)) return me;
    sessionRecord(ctx.store, me.token, me.user.id, ctx.headers['user-agent']);
    const sessions: ActiveSession[] = ctx.store.account.sessions
      .filter((s) => s.userId === me.user.id)
      .map((s) => ({ id: s.id, device: s.device, lastActiveAt: s.lastActiveAt, current: s.token === me.token }));
    return ok(sessions);
  });
}

/** Named store changes tests can ask for (`backend.scenario(name, args)`), including identity's. */
export const accountScenarios: Record<string, (store: Store, args: any) => unknown> = {
  ...identityScenarios,
};

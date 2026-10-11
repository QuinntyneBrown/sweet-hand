import type { Router } from '../lib/router.ts';
import { forbidden, invalid, notFound, ok, unauthorized, type Ctx, type Reply } from '../lib/http.ts';
import { currentUser, type Store } from '../lib/store.ts';
import type { User } from '../seed/users.ts';
import type { AccountView, ActiveSession, ChangePasswordRequest, UpdateDetailsRequest } from '../../projects/api/src/lib/models/account.models.ts';
import { findUser, identityScenarios, passwordProblem, sendEmail, sendVerification } from './identity.ts';
import { endSession, endSessions, sessionRecord } from './session.ts';

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

  /** A new password ends every other session and is confirmed by email. */
  r.post('/api/me/password', (ctx): Reply => {
    const me = signedIn(ctx);
    if (isReply(me)) return me;
    const body = (ctx.body ?? {}) as Partial<ChangePasswordRequest>;
    if (body.currentPassword !== me.user.password) return invalid({ currentPassword: ['That password isn’t right'] });
    const weak = passwordProblem(body.newPassword);
    if (weak) return invalid({ newPassword: [weak] });
    me.user.password = String(body.newPassword);
    me.user.passwordChangedAt = ctx.store.now.toISOString();
    endSessions(ctx.store, me.user.id, me.token);
    sendEmail(ctx.store, me.user.email, 'password-changed');
    return { status: 204 };
  });

  /** Ends one of the caller's own sessions; anyone else's is not found (L2-078.4, L2-078.5). */
  r.delete('/api/me/sessions/:id', (ctx): Reply => {
    const me = signedIn(ctx);
    if (isReply(me)) return me;
    const record = ctx.store.account.sessions.find((s) => s.id === ctx.params['id'] && s.userId === me.user.id);
    if (!record) return notFound();
    endSession(ctx.store, record.token);
    return { status: 204 };
  });

  /** Starts an export; the link is emailed within 24 hours and works for 7 days (L2-071). */
  r.post('/api/me/data-exports', (ctx): Reply => {
    const me = signedIn(ctx);
    if (isReply(me)) return me;
    ctx.store.account.dataExports[me.user.id] ??= ctx.store.now.toISOString();
    return { status: 202, body: accountView(ctx.store, me.user) };
  });

  /**
   * Closes the account after the password is confirmed: every session ends,
   * a confirmation is emailed, and a caterer's profile leaves public view.
   * Anonymising and deleting follow within 30 days (L2-072).
   */
  r.post('/api/me/deletion', (ctx): Reply => {
    const me = signedIn(ctx);
    if (isReply(me)) return me;
    if (me.user.role === 'Operator') return forbidden();
    if ((ctx.body ?? {}).password !== me.user.password) return invalid({ password: ['That password isn’t right'] });
    me.user.deleted = true;
    const profile = me.user.catererId ? ctx.store.caterers.find((c) => c.id === me.user.catererId) : undefined;
    if (profile) profile.status = 'Removed';
    endSessions(ctx.store, me.user.id);
    sendEmail(ctx.store, me.user.email, 'account-deleted');
    return { status: 204, headers: { 'set-cookie': 'sh_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax' } };
  });

  /** Site-wide notices; public by deliberate choice (L2-088, L2-091). */
  r.get('/api/public/notices', (ctx): Reply => ok(ctx.store.account.notices));

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
  /** The account is waiting for its email to be verified; the link went out at `sentAt` (L2-023.2). */
  'unverify-email': (store, { email, sentAt }: { email: string; sentAt?: string }) => {
    const user = findUser(store, email);
    if (!user) throw new Error(`No account for ${email}`);
    user.emailVerified = false;
    user.verificationSentAt = sentAt ?? store.now.toISOString();
  },
  /** Planned maintenance in a window (L2-088). */
  'schedule-maintenance': (store, { startsAt, endsAt }: { startsAt: string; endsAt: string }) => {
    store.account.notices.push({ id: `maintenance-${startsAt}`, kind: 'maintenance', startsAt, endsAt });
  },
  /** A dependency is struggling (L2-091). */
  'degrade-service': (store) => {
    store.account.notices.push({ id: 'degraded', kind: 'degraded' });
  },
  /** The person opened their verification link somewhere else. */
  'verify-email-now': (store, { email }: { email: string }) => {
    const user = findUser(store, email);
    if (user) user.emailVerified = true;
  },
  /** Mail to the address bounced permanently (L2-030.3). */
  'bounce-email': (store, { email }: { email: string }) => {
    const user = findUser(store, email);
    if (!user) throw new Error(`No account for ${email}`);
    user.emailBounced = true;
  },
};

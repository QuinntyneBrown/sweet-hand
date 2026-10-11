import type { Request, Reply } from '../http/router.ts';
import { gone, ok } from '../http/problems.ts';
import type { Document, Transaction } from '../platform/database.ts';
import { caterers } from '../caterers/model.ts';
import type { EmailVerified } from '@contract/email-verified.ts';
import type { ResendVerificationRequest } from '@contract/resend-verification-request.ts';
import type { VerificationSent } from '@contract/verification-sent.ts';
import { findUserByEmail, liveUser, users } from './model.ts';
import { consumeToken, findToken, liveToken, sendVerification } from './tokens.ts';

/** An enquiry a customer filled in before verifying their email (L2-023.3), keyed by user id. */
export interface SavedEnquiry extends Document {
  catererSlug: string;
  eventDate: string;
  guests: number;
}

export const savedEnquiries = (tx: Transaction) => tx.collection<SavedEnquiry>('savedEnquiries');

const expired = () => gone('This link has expired');

/** A verification link: valid for 24 hours, once (L2-077.3). */
export async function verifyEmail(req: Request): Promise<Reply> {
  const token = await liveToken(req.tx, req.now, 'verify', req.body?.token);
  const user = await liveUser(req.tx, token?.userId);
  if (!token || !user) return expired();
  await consumeToken(req.tx, req.now, token);
  await users(req.tx).put({ ...user, emailVerified: true });
  const draft = await savedEnquiries(req.tx).get(user.id);
  const caterer = draft && (await caterers(req.tx).findOne({ slug: draft.catererSlug }));
  const body: EmailVerified = {
    displayName: user.displayName,
    savedEnquiry:
      draft && caterer
        ? { catererName: caterer.name, catererSlug: caterer.slug, photo: caterer.photos[0]?.file ?? `${caterer.slug}.jpg`, eventDate: draft.eventDate, guests: draft.guests }
        : null,
  };
  return ok(body);
}

/**
 * A new verification link for the signed-in account, the account an expired
 * link belongs to, or an address waiting for verification. Always 202, so it
 * never reveals whether an address has an account (L2-076).
 */
export async function resendVerification(req: Request): Promise<Reply> {
  const body = (req.body ?? {}) as ResendVerificationRequest;
  const fromToken = body.token ? await findToken(req.tx, 'verify', body.token) : undefined;
  const signedIn = req.actor ? await liveUser(req.tx, req.actor.userId) : undefined;
  const user = signedIn ?? (await liveUser(req.tx, fromToken?.userId)) ?? (body.email ? await findUserByEmail(req.tx, body.email) : undefined);
  if (user && !user.emailVerified) await sendVerification(req, user);
  const sent: VerificationSent = { email: user && (fromToken || !body.email) ? user.email : (body.email ?? null) };
  return { status: 202, body: sent };
}

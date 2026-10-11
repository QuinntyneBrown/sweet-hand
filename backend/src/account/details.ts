import type { Request, Reply } from '../http/endpoint.ts';
import { invalid, ok } from '../http/problems.ts';
import type { UpdateDetailsRequest } from '@contract/update-details-request.ts';
import { findUserByEmail, users } from '../identity/model.ts';
import { EMAIL, length, normalisePhone, text } from '../identity/registration.ts';
import { currentUser } from '../identity/sessions.ts';
import { sendVerification } from '../identity/tokens.ts';
import { accountViewOf } from './account-view.ts';

/** "+14165550199" → "+1 416 555 0199", the form the account page shows. */
const displayPhone = (e164: string): string => `+1 ${e164.slice(2, 5)} ${e164.slice(5, 8)} ${e164.slice(8)}`;

/** Name, email and phone; a new email must be verified again (L2-077.3). */
export async function updateDetails(req: Request): Promise<Reply> {
  const user = currentUser(req);
  const body = (req.body ?? {}) as Partial<UpdateDetailsRequest>;
  const displayName = text(body.displayName);
  const email = text(body.email);
  const phoneText = text(body.phone);
  const phone = phoneText ? normalisePhone(phoneText) : null;
  const errors: Record<string, string[]> = {};
  if (length(displayName) < 2 || length(displayName) > 50) errors['name'] = ['Enter a display name of 2 to 50 characters'];
  const emailChanged = email.toLowerCase() !== user.emailKey;
  if (!EMAIL.test(email) || length(email) > 254) errors['email'] = ['Enter an email address like name@example.com'];
  else if (emailChanged && (await findUserByEmail(req.tx, email))) errors['email'] = ['Use a different email address'];
  if (phoneText && !phone) errors['phone'] = ['Enter a 10-digit Canadian phone number'];
  if (Object.keys(errors).length) return invalid(errors);

  let updated = { ...user, displayName, email, emailKey: email.toLowerCase(), phone: phone ? displayPhone(phone) : undefined };
  if (emailChanged) updated = { ...updated, emailVerified: false, emailBounced: false };
  await users(req.tx).put(updated);
  if (emailChanged) await sendVerification(req, updated);
  return ok(await accountViewOf(req.tx, (await users(req.tx).get(user.id))!));
}

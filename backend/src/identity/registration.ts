import { randomUUID } from 'node:crypto';
import type { Request, Reply } from '../http/endpoint.ts';
import { accepted, invalid } from '../http/problems.ts';
import { validChallenge } from '../platform/bot-challenge.ts';
import { queueEmail } from '../platform/outbox.ts';
import { hashPassword } from '../platform/secrets.ts';
import { caterers, slugify } from '../caterers/model.ts';
import type { RegisterCatererRequest } from '@contract/register-caterer-request.ts';
import type { RegisterRequest } from '@contract/register-request.ts';
import { findUserByEmail, users, type User } from './model.ts';
import { passwordProblem } from './passwords.ts';
import { currentPrivacyNotice } from './privacy.ts';
import { startSession } from './sessions.ts';
import { sendVerification } from './tokens.ts';

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
export const length = (v: string): number => [...v].length;

/** "+14165550199" from any 10-digit North American form (L2-037.2). */
export function normalisePhone(value: string): string | null {
  if (!/^\+?[\d\s().-]+$/.test(value)) return null;
  let digits = value.replace(/\D/g, '');
  if (value.startsWith('+')) {
    if (!digits.startsWith('1')) return null;
    digits = digits.slice(1);
  } else if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  return digits.length === 10 ? `+1${digits}` : null;
}

async function newUser(req: Request, fields: Pick<User, 'role' | 'displayName' | 'email'> & Partial<User>, password: string): Promise<User> {
  const now = req.now.toISOString();
  const notice = await currentPrivacyNotice(req.tx);
  const user: User = {
    id: `user-${randomUUID()}`,
    ...fields,
    emailKey: fields.email.toLowerCase(),
    passwordHash: await hashPassword(password),
    passwordChangedAt: now,
    emailVerified: false,
    createdAt: now,
    acceptedPrivacyVersion: notice.version,
    acceptedPrivacyAt: now,
  };
  await users(req.tx).put(user);
  return user;
}

/** An email that already has an account gets the same answer, and its owner an email instead (L2-076, L2-037.4). */
async function alreadyRegistered(req: Request, email: string): Promise<boolean> {
  const existing = await findUserByEmail(req.tx, email);
  if (!existing) return false;
  await queueEmail(req.tx, req.now, { to: existing.email, kind: 'registration-attempt' });
  return true;
}

/** Customer registration (register-customer design). The role is never read from the body (L2-079.2). */
export async function registerCustomer(req: Request): Promise<Reply> {
  const body = (req.body ?? {}) as Partial<RegisterRequest>;
  if (!validChallenge(body.challengeToken, 'register')) return invalid({ challengeToken: ['Confirm you’re a person'] });
  const displayName = text(body.displayName);
  const email = text(body.email);
  const errors: Record<string, string[]> = {};
  if (length(displayName) < 2 || length(displayName) > 50) errors['name'] = ['Enter a display name of 2 to 50 characters'];
  if (!EMAIL.test(email) || length(email) > 254) errors['email'] = ['Enter an email address like name@example.com'];
  const weak = passwordProblem(body.password);
  if (weak) errors['password'] = [weak];
  if (body.consent !== true) errors['consent'] = ['Tick the box to agree to the privacy notice'];
  if (Object.keys(errors).length) return invalid(errors);

  if (await alreadyRegistered(req, email)) return accepted();
  const user = await newUser(req, { role: 'Customer', displayName, email }, String(body.password));
  await sendVerification(req, user);
  return accepted();
}

async function uniqueSlug(req: Request, name: string): Promise<string> {
  const base = slugify(name) || 'caterer';
  const taken = new Set((await caterers(req.tx).all()).flatMap((c) => [c.slug, ...c.previousSlugs]));
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

/**
 * Caterer registration (register-caterer design): an account, a draft
 * profile, a verification email and a session so the caterer can set up
 * their profile (L2-037.1).
 */
export async function registerCaterer(req: Request): Promise<Reply> {
  const body = (req.body ?? {}) as Partial<RegisterCatererRequest>;
  if (!validChallenge(body.challengeToken, 'register-caterer')) return invalid({ challengeToken: ['Confirm you’re a person'] });
  const businessName = text(body.businessName);
  const contactName = text(body.contactName);
  const email = text(body.email);
  const phone = normalisePhone(text(body.phone));
  const errors: Record<string, string[]> = {};
  if (length(businessName) < 2 || length(businessName) > 80) errors['business'] = ['Enter a business name of 2 to 80 characters'];
  if (length(contactName) < 2 || length(contactName) > 50) errors['contact'] = ['Enter your name, 2 to 50 characters'];
  if (!EMAIL.test(email) || length(email) > 254) errors['email'] = ['Enter an email address like name@example.com'];
  if (!phone) errors['phone'] = ['Enter a 10-digit Canadian phone number'];
  const weak = passwordProblem(body.password);
  if (weak) errors['password'] = [weak];
  if (body.sellsCaribbeanFoodInGta !== true) errors['sells'] = ['Confirm that you sell Caribbean food in Toronto or the GTA'];
  if (body.acceptsTermsAndPrivacyNotice !== true) errors['terms'] = ['Accept the caterer terms and privacy notice to continue'];
  if (Object.keys(errors).length) return invalid(errors);

  if (await alreadyRegistered(req, email)) return accepted();
  const catererId = `cat-${randomUUID()}`;
  const user = await newUser(req, { role: 'Caterer', displayName: contactName, email, phone: phone!, catererId }, String(body.password));
  await caterers(req.tx).put({
    id: catererId,
    slug: await uniqueSlug(req, businessName),
    name: businessName,
    status: 'Draft',
    ownerUserId: user.id,
    cuisines: [],
    areas: [],
    minGuests: 0,
    maxGuests: 0,
    occasions: [],
    description: '',
    photos: [],
    dishes: [],
    createdAt: req.now.toISOString(),
    previousSlugs: [],
  });
  await sendVerification(req, user);
  await startSession(req, user);
  return accepted();
}

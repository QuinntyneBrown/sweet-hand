import type { LaunchRole } from '@contract/launch-role.ts';

export const CHOOSE_ROLE = 'Choose one';
export const ENTER_EMAIL = 'Enter an email like name@example.com';
export const TICK_CONSENT = 'Tick the box to get the email';

/** One `@`, a non-empty local part and a domain with a dot and a top-level part of 2+ letters (L2-095). */
const EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f]/;
const length = (v: string): number => [...v].length;

export interface SignUpCommand {
  role: LaunchRole;
  email: string;
  businessName?: string;
}

export type Validation = { ok: true; command: SignUpCommand } | { ok: false; errors: Record<string, string[]> };

/** The trimmed, lower-cased form used to find an entry (L2-096.7). */
export const emailKey = (email: string): string => email.trim().toLowerCase();

/** Server-side checks of a sign-up body, field by field (L2-096.5, L2-104.7). */
export function validateSignUp(body: Record<string, unknown>): Validation {
  const errors: Record<string, string[]> = {};
  const role = body['role'];
  const rawEmail = body['email'];
  const rawBusiness = body['businessName'];
  if (role !== 'customer' && role !== 'caterer') errors['role'] = [CHOOSE_ROLE];
  const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';
  if (typeof rawEmail !== 'string' || CONTROL.test(rawEmail) || length(email) > 254 || !EMAIL.test(email)) errors['email'] = [ENTER_EMAIL];
  let businessName: string | undefined;
  if (rawBusiness !== undefined && rawBusiness !== null) {
    const trimmed = typeof rawBusiness === 'string' ? rawBusiness.trim() : '';
    if (typeof rawBusiness !== 'string' || CONTROL.test(rawBusiness) || length(trimmed) > 60 || role !== 'caterer') {
      errors['businessName'] = ['Enter a business name of up to 60 characters'];
    } else if (trimmed) {
      businessName = trimmed;
    }
  }
  if (body['consent'] !== true) errors['consent'] = [TICK_CONSENT];
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, command: { role: role as LaunchRole, email, ...(businessName ? { businessName } : {}) } };
}

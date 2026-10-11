/**
 * Account rules the forms check before sending (L2-023, L2-037, L2-076.1).
 * The server checks them again, plus the breached-password list.
 */

export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;

const trimmedLength = (value: string) => [...value.trim()].length;

/** Display name and contact name: 2 to 50 characters (L2-023, L2-037). */
export function displayNameError(value: string): string | null {
  const n = trimmedLength(value);
  return n >= 2 && n <= 50 ? null : $localize`:@@rules.displayName:Enter a display name of 2 to 50 characters`;
}

export function contactNameError(value: string): string | null {
  const n = trimmedLength(value);
  return n >= 2 && n <= 50 ? null : $localize`:@@rules.contactName:Enter your name, 2 to 50 characters`;
}

/** Business name: 2 to 80 characters (L2-037). */
export function businessNameError(value: string): string | null {
  const n = trimmedLength(value);
  return n >= 2 && n <= 80 ? null : $localize`:@@rules.businessName:Enter a business name of 2 to 80 characters`;
}

/** A new password: 12 to 128 characters (L2-076.1). Passwords are never trimmed. */
export function newPasswordError(value: string): string | null {
  const n = [...value].length;
  if (!n) return $localize`:@@rules.passwordRequired:Enter a password`;
  if (n < PASSWORD_MIN) return $localize`:@@rules.passwordShort:Use at least 12 characters. Yours has ${n}:count:.`;
  if (n > PASSWORD_MAX) return $localize`:@@rules.passwordLong:Use 128 characters or fewer`;
  return null;
}

/**
 * A 10-digit North American number with or without +1, spaces, dashes,
 * dots or brackets, stored as "+14165550199" (L2-037.2). Null when invalid.
 */
export function normalisePhone(value: string): string | null {
  const v = value.trim();
  if (!/^\+?[\d\s().-]+$/.test(v)) return null;
  let digits = v.replace(/\D/g, '');
  if (v.startsWith('+')) {
    if (!digits.startsWith('1')) return null;
    digits = digits.slice(1);
  } else if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  return digits.length === 10 ? `+1${digits}` : null;
}

export function phoneError(value: string): string | null {
  return normalisePhone(value) ? null : $localize`:@@rules.phone:Enter a 10-digit Canadian phone number`;
}

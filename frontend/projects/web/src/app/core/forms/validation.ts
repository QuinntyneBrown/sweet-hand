/** Shared input rules for every form (L2-076, L2-080). Messages come from the resource files. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailError(value: string): string | null {
  const v = value.trim();
  if (!v) return $localize`:@@validation.emailRequired:Enter your email address`;
  if (!EMAIL.test(v)) return $localize`:@@validation.emailFormat:Enter an email address like name@example.com`;
  return null;
}

/** "Fix 1 thing to sign in" / "Fix 3 things to sign in" — `action` completes the sentence. */
export function summaryHeading(count: number, action: string): string {
  return count === 1
    ? $localize`:@@validation.fixOne:Fix 1 thing to ${action}:action:`
    : $localize`:@@validation.fixMany:Fix ${count}:count: things to ${action}:action:`;
}

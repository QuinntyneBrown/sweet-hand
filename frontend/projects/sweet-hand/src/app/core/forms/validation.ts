/** Shared input rules for every form (L2-076, L2-080). Messages come from the resource files. */

import type { SummaryItem } from '@sweet-hand/components';

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

/**
 * The error summary's items, in the order of `controls`: each field with an
 * error links to its control. Give a list when each field's control id is its
 * name, or a map from field to control id.
 */
export function summaryFrom<F extends string>(errors: Partial<Record<F, string | null>>, controls: readonly F[] | Readonly<Record<F, string>>): SummaryItem[] {
  const ids: [F, string][] = Array.isArray(controls) ? (controls as readonly F[]).map((f) => [f, f]) : (Object.entries(controls) as [F, string][]);
  return ids.flatMap(([f, controlId]) => {
    const message = errors[f];
    return message ? [{ controlId, message }] : [];
  });
}

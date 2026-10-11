import type { LaunchRole, LaunchSignUpRequest } from '@sweet-hand/api';

/** What the visitor has entered in the sign-up form. */
export interface LaunchFormValues {
  role: LaunchRole | null;
  email: string;
  businessName: string;
  consent: boolean;
}

export type LaunchField = 'role' | 'email' | 'consent';
export type LaunchFormErrors = Partial<Record<LaunchField, string>>;

/** The fields in form order, with the element each summary link focuses (L2-096.3). */
export const LAUNCH_FIELDS: readonly { field: LaunchField; target: string }[] = [
  { field: 'role', target: 'role-event' },
  { field: 'email', target: 'email' },
  { field: 'consent', target: 'consent' },
];

export const emptyLaunchForm = (): LaunchFormValues => ({ role: null, email: '', businessName: '', consent: false });

export const messages: Record<LaunchField, string> = {
  role: $localize`:@@launch.signUp.errorRole:Choose one`,
  email: $localize`:@@launch.signUp.errorEmail:Enter an email like name@example.com`,
  consent: $localize`:@@launch.signUp.errorConsent:Tick the box to get the email`,
};

/** One `@`, a non-empty local part and a domain with a dot and a top-level part of 2+ letters (L2-095). */
const EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export function validEmail(value: string): boolean {
  const email = value.trim();
  return [...email].length <= 254 && EMAIL.test(email);
}

/** Every problem at once, in field order (L2-096.1). The server checks again. */
export function validateLaunchForm(values: LaunchFormValues): LaunchFormErrors {
  const errors: LaunchFormErrors = {};
  if (!values.role) errors.role = messages.role;
  if (!validEmail(values.email)) errors.email = messages.email;
  if (!values.consent) errors.consent = messages.consent;
  return errors;
}

/** Whether one field's value now passes, so its inline message can go at once (L2-096.4). */
export function fieldFixed(field: LaunchField, values: LaunchFormValues): boolean {
  return !validateLaunchForm(values)[field];
}

/** The server's field errors, shown with the page's own messages (L2-096.6). */
export function fromServerErrors(errors: Record<string, string[]> | undefined): LaunchFormErrors {
  const out: LaunchFormErrors = {};
  for (const { field } of LAUNCH_FIELDS) if (errors?.[field]?.length) out[field] = messages[field];
  return out;
}

/** The request; a business name goes only with the caterer role (L2-095.3). */
export function toRequest(values: LaunchFormValues, challengeToken: string): LaunchSignUpRequest {
  const businessName = values.businessName.trim();
  return {
    role: values.role!,
    email: values.email.trim(),
    ...(values.role === 'caterer' && businessName ? { businessName } : {}),
    consent: true,
    challengeToken,
  };
}

/** The first 8 characters of the correlation ID, or of an ID made here when no response came back (L2-097.3). */
export function failureReference(correlationId: string | null): string {
  return (correlationId || crypto.randomUUID()).slice(0, 8);
}

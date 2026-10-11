/**
 * A stand-in for the 100,000 most common breached passwords (L2-076.1). The
 * full list is `<TO SUPPLY>`; these are the ones the product's tests use.
 */
const BREACHED = new Set(['sunshine2026', 'sunshine2025', 'password1234', 'qwertyuiop12', 'iloveyou2026', '123456789012', 'letmein12345']);

/** The rule the server applies to every new password; the client checks the length first (L2-076.1). */
export function passwordProblem(password: unknown): string | null {
  const p = typeof password === 'string' ? password : '';
  const length = [...p].length;
  if (length < 12 || length > 128) return 'Use 12 to 128 characters';
  if (BREACHED.has(p.toLowerCase())) return 'This password is too common';
  return null;
}

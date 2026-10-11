/** Small text helpers shared by the operator settings use cases. */

/** Case-, accent- and spacing-insensitive comparison key, so "HAÏTIAN" matches "Haitian". */
export const fold = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Collapses runs of whitespace and trims. */
export const tidy = (value: unknown): string => String(value ?? '').replace(/\s+/g, ' ').trim();

export const byName = (a: { name: string }, b: { name: string }): number => a.name.localeCompare(b.name, 'en-CA');

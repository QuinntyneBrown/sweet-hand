/** What the operator changed, for the page's toast. */
export type EditOutcome = { kind: 'edit' } | { kind: 'photo' | 'dish'; replaceBy: string | null };

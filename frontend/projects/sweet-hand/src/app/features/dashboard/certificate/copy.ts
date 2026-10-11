/** The copy beside the form: the saved one, a newly chosen one, or one that was refused. */
export type Copy = { kind: 'saved'; name: string; meta: string } | { kind: 'chosen'; file: File; meta: string } | { kind: 'failed'; file: File | null; name: string; message: string } | null;

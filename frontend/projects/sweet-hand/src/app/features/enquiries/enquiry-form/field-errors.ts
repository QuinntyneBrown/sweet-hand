import type { Field } from './enquiry-rules';

export type FieldErrors = Partial<Record<Field, string>>;

import type { BreachField } from './breach-rules';

export type BreachErrors = Partial<Record<BreachField, string | null>>;

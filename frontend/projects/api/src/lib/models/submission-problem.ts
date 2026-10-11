import type { ChecklistKey } from './checklist-key';

/** HTTP 422 from a refused submission: every rule that failed (L2-039.3). */
export interface SubmissionProblem {
  title: string;
  failed: { key: ChecklistKey; detail: string | null }[];
}

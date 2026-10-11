/** 403 body from Admin-only endpoints: who to ask instead (L2-056.5). */
export interface AdminOnlyProblem {
  title: string;
  admins: string[];
}

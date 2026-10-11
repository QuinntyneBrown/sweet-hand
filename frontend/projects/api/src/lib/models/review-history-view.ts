export interface ReviewHistoryView {
  at: string;
  step: 'created' | 'submitted' | 'resubmitted' | 'changes-requested' | 'published' | 'name-change-requested';
  by: string | null;
  reason: string | null;
}

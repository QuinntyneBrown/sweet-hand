/** HTTP 409 body when the signed-in reporter's earlier report is still open (L2-054.4). */
export interface ReportDuplicate {
  title: string;
  reportedAt: string;
}

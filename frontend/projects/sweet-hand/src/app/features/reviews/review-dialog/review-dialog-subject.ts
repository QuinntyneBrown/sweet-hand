/** What the dialog writes or edits. */
export type ReviewDialogSubject =
  | { mode: 'write'; slug: string; catererName: string; eventDate: string; reviewerLabel: string }
  | { mode: 'edit'; reviewId: string; catererName: string; eventMonth: string; reviewerLabel: string; rating: number; text: string; editableUntil: string };

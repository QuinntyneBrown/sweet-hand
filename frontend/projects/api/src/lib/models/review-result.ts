/** Answer to posting or editing: published at once, or held for a quick check (L2-050.3). */
export interface ReviewResult {
  status: 'Published' | 'Held';
  editableUntil: string;
}

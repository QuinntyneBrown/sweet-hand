import type { InboxRowView } from './inbox-row-view';
import type { InboxCounts } from './inbox-counts';

export interface InboxPageView {
  items: InboxRowView[];
  /** Enquiries that match the filter. */
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  /** Enquiries per status, ignoring the filter. */
  counts: InboxCounts;
  /** Threads with something unread (L2-029). */
  unread: number;
}

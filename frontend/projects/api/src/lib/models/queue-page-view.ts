import type { QueueItemView } from './queue-item-view';
import type { QueueCounts } from './queue-counts';

export interface QueuePageView {
  /** Oldest first. */
  items: QueueItemView[];
  /** Items that match the filter. */
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  /** Items of each kind, ignoring the filter. */
  counts: QueueCounts;
  /** Late items, ignoring the filter. */
  late: number;
}

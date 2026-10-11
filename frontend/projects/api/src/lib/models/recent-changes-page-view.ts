import type { RecentChangeView } from './recent-change-view';

export interface RecentChangesPageView {
  /** Newest first, from the last 30 days. */
  items: RecentChangeView[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

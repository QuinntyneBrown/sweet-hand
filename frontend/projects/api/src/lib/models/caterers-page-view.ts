import type { CatererRowView } from './caterer-row-view';
import type { CatererCounts } from './caterer-counts';
import type { ProfileStatus } from './profile-status';

export interface CaterersPageView {
  /** Most recently changed first. */
  items: CatererRowView[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  /** Caterers in each status, ignoring the filters. */
  counts: CatererCounts;
  /** With a search and a status that match nothing: the first caterer the search finds in another status. */
  otherMatch: { name: string; status: ProfileStatus } | null;
}

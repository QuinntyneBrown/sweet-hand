import type { InboxPageView, OwnProfileView, OwnReviewPageView, ReferenceDataView } from '@sweet-hand/api';

export interface Loaded {
  profile: OwnProfileView;
  ref: ReferenceDataView;
  inbox: InboxPageView;
  reviews: OwnReviewPageView;
}

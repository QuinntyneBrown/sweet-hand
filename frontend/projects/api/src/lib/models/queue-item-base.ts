export interface QueueItemBase {
  /** Stable for the life of the item ("profile:cat-910"). */
  id: string;
  /** The caterer id, or the first report's id for a report group, or the review id. */
  targetId: string;
  title: string;
  /** The caterer's cover at 400 px, when there is one. */
  photo: string | null;
  /** Submission, name-change request, expiry detection, first open report or hold time (ISO, UTC). */
  waitingSince: string;
  /** Waiting 3 days or more: the domain's rule (queue-item CRD D-3). */
  late: boolean;
}

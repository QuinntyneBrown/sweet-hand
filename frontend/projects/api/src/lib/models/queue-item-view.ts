import type { QueueItemBase } from './queue-item-base';
import type { ProfileStatus } from './profile-status';
import type { ReportReason } from './report-reason';
import type { HoldReason } from './hold-reason';

export type QueueItemView =
  | (QueueItemBase & { kind: 'profile' | 'resubmitted'; cuisine: string; area: string })
  | (QueueItemBase & { kind: 'name-change'; newName: string; status: ProfileStatus })
  | (QueueItemBase & { kind: 'certificate'; expired: string; status: ProfileStatus })
  | (QueueItemBase & { kind: 'reports'; count: number; reasons: ReportReason[]; hidden: boolean })
  | (QueueItemBase & { kind: 'held-review'; holdReason: HoldReason });

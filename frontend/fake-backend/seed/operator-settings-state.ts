import type { BreachRecord } from '../../projects/api/src/lib/models/breach-record.ts';
import type { InvitedOperator } from './invited-operator.ts';
import type { DailyMetrics } from './operator-settings.ts';

export interface OperatorSettingsState {
  /** Who added a cuisine after launch, and when cuisines were retired. */
  cuisineAddedBy: Record<string, string>;
  cuisineRetiredAt: Record<string, string>;
  breaches: BreachRecord[];
  invitations: InvitedOperator[];
  deactivated: Record<string, string>;
  /** Last activity of operators not signed in during the test. */
  lastActive: Record<string, string>;
  /** Denied Admin-only requests (L2-056.3, L2-084). */
  securityEvents: { at: string; userId: string; path: string }[];
  /** First day with figures. */
  metricsStart: string;
  metrics: DailyMetrics[];
  /** Caterers by status today, apart from Published (computed from the history). */
  otherStatuses: { status: string; count: number }[];
  publishedToday: number;
}

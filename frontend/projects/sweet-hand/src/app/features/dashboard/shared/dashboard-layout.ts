import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CatererCard, SideNav } from '@sweet-hand/components';
import { Session } from '../../../core/session/session';
import { dashboardNav, type NavKey } from './profile-text';
import { type OwnProfileStatus } from '@sweet-hand/api';

/**
 * The caterer dashboard's work layout (container CRD, `work-layout`): side
 * navigation from LG, the work, and from XL the listing-card preview
 * (L2-045.3, L2-045.4). The preview's card is projected as `[slot=preview]`.
 */
@Component({
  selector: 'app-dashboard-layout',
  imports: [CatererCard, SideNav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {
  private readonly session = inject(Session);

  readonly current = input.required<NavKey>();
  /** The profile's status once known; a removed caterer gets the short navigation. */
  readonly status = input<OwnProfileStatus | null>(null);
  /** "Your listing card", "Live preview", "How you’ll appear"; null for no preview. */
  readonly previewLabel = input<string | null>(null);
  readonly previewBusy = input(false);
  /** A reading column (reviews). */
  readonly narrow = input(false);

  protected readonly nav = computed(() => dashboardNav(this.current(), this.status() ?? this.session.user()?.caterer?.status ?? null, this.session.unread()));
}

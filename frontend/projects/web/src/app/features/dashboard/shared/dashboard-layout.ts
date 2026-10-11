import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CatererCard, SideNav } from '@sweet-hand/components';
import type { OwnProfileStatus } from '../../../core/api/caterer-profile.models';
import { Session } from '../../../core/session/session';
import { dashboardNav, type NavKey } from './profile-text';

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
  template: `
    <div [class]="previewLabel() || previewBusy() ? 'work-layout work-layout--preview' : 'work-layout'">
      <sh-side-nav label="Dashboard" i18n-label="@@dashboard.nav" [groups]="nav()" />
      <div class="work-main" [style.max-width]="narrow() ? '48rem' : null"><ng-content /></div>
      @if (previewBusy()) {
        <aside class="preview-pane" aria-hidden="true">
          <span class="skeleton skeleton--text" style="width: 8rem"></span>
          <sh-caterer-card [skeleton]="true" />
        </aside>
      } @else if (previewLabel()) {
        <aside class="preview-pane" aria-labelledby="preview-title">
          <h2 class="preview-pane__label" id="preview-title">{{ previewLabel() }}</h2>
          <ng-content select="[slot=preview]" />
        </aside>
      }
    </div>
  `,
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

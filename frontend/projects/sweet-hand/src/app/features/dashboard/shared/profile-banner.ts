import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Alert } from '@sweet-hand/components';
import { RULE_HREF, SECTION_HREF, attentionAction } from './profile-text';
import type { BannerProfile } from './banner-profile';

/**
 * The profile's state on dashboard pages that have no status message of their
 * own (docs/mocks/notifications/profile-banner): in review, changes requested,
 * suspended, or a name change waiting for review.
 */
@Component({
  selector: 'app-profile-banner',
  imports: [RouterLink, Alert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './profile-banner.html',
})
export class ProfileBanner {
  readonly profile = input.required<BannerProfile>();

  protected readonly dismissed = signal(false);
  protected readonly certificateHref = SECTION_HREF['food-safety'];
  protected readonly detailsHref = SECTION_HREF.details;

  protected readonly kind = computed(() => {
    const p = this.profile();
    switch (p.status) {
      case 'Pending review':
        return 'pending';
      case 'Changes requested':
        return 'changes';
      case 'Suspended':
        return 'suspended';
      case 'Published':
        return p.pendingName ? 'rename' : null;
      default:
        return null;
    }
  });
  protected readonly reason = computed(() => $localize`:@@banner.reason:“${this.profile().statusReason ?? ''}:reason:”`);
  protected readonly attentionHref = computed(() => RULE_HREF[this.profile().attention[0]?.key ?? 'name']);
  protected readonly attentionLabel = computed(() => attentionAction(this.profile().attention[0]?.key ?? 'name'));
  protected readonly renameText = computed(() => {
    const p = this.profile();
    return $localize`:@@banner.renameText:Your page shows “${p.name}:current:” until “${p.pendingName?.name ?? ''}:requested:” is approved.`;
  });
}

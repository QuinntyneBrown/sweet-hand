import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Alert } from '@sweet-hand/components';
import { RULE_HREF, SECTION_HREF, attentionAction } from './profile-text';
import { type OwnProfileStatus } from '@sweet-hand/api';

/** What the banner needs to know about the profile. */
export interface BannerProfile {
  name: string;
  status: OwnProfileStatus;
  statusReason: string | null;
  pendingName: { name: string } | null;
  attention: { key: keyof typeof RULE_HREF }[];
}

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
  template: `
    @switch (kind()) {
      @case ('pending') {
        @if (!dismissed()) {
          <sh-alert [banner]="true" live="polite" title="Your profile is in review" i18n-title="@@banner.inReview" [dismissible]="true" dismissLabel="Dismiss" i18n-dismissLabel="@@toast.dismiss" (dismissed)="dismissed.set(true)"
            ><ng-container i18n="@@banner.inReviewText">We’ll email you within 3 business days.</ng-container></sh-alert
          >
        }
      }
      @case ('changes') {
        <sh-alert [banner]="true" tone="warning" live="polite" title="Changes requested" i18n-title="@@profileStatus.changes"
          >{{ reason() }}<span slot="actions" class="alert__actions"><a [routerLink]="attentionHref()">{{ attentionLabel() }}</a></span></sh-alert
        >
      }
      @case ('suspended') {
        <sh-alert [banner]="true" tone="danger" live="polite" title="Your profile is suspended and hidden from customers" i18n-title="@@certificate.suspendedTitle"
          >{{ profile().statusReason }}<span slot="actions" class="alert__actions"><a [routerLink]="certificateHref" i18n="@@suspended.upload">Upload a new certificate</a></span></sh-alert
        >
      }
      @case ('rename') {
        <sh-alert [banner]="true" live="polite" title="Name change waiting for review" i18n-title="@@nameChange.title"
          >{{ renameText() }}<span slot="actions" class="alert__actions"><a class="link--standalone" [routerLink]="detailsHref" i18n="@@nameChange.see">See the change</a></span></sh-alert
        >
      }
    }
  `,
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

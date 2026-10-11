import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Alert } from '@sweet-hand/components';
import { SECTION_HREF } from './profile-text';
import { type OwnProfileView } from '@sweet-hand/api';

/**
 * Why a section cannot be edited: waiting for review, with Withdraw submission
 * (L2-039.4), or suspended with the operator's reason (L2-044.4).
 */
@Component({
  selector: 'app-status-notice',
  imports: [RouterLink, Alert],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './status-notice.html',
})
export class StatusNotice {
  readonly profile = input.required<OwnProfileView>();
  /** "details" pages say how to edit; photo and menu pages say editing is paused. */
  readonly variant = input<'details' | 'section' | 'list'>('section');
  readonly withdrawRequested = output<HTMLElement>();

  protected readonly certificateHref = SECTION_HREF['food-safety'];

  protected readonly pendingTitle = computed(() =>
    this.variant() === 'list' ? $localize`:@@pending.listTitle:Waiting for review` : $localize`:@@pending.title:Your profile is waiting for review`,
  );
  protected readonly pendingText = computed(() => {
    switch (this.variant()) {
      case 'details':
        return $localize`:@@pending.detailsText:It can’t be changed while we look at it. Withdraw the submission if you need to edit something.`;
      case 'list':
        return $localize`:@@pending.listText:Editing is paused while we review your profile, usually within 3 business days.`;
      default:
        return $localize`:@@pending.text:It can’t be changed while we look at it.`;
    }
  });
  protected readonly suspendedText = computed(() => {
    const reason = this.profile().statusReason ?? '';
    return this.variant() === 'details'
      ? $localize`:@@suspended.detailsText:“${reason}:reason:” Details can’t be edited until the suspension is lifted.`
      : $localize`:@@suspended.text:“${reason}:reason:” This section can’t be edited until the suspension is lifted.`;
  });
}

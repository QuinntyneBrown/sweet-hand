import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Alert, Check, Dialog, Icon, Timeline, TimelineEntry } from '@sweet-hand/components';
import { RULE_HREF } from '../shared/profile-text';
import { type ChecklistKey } from '@sweet-hand/api';
import type { SubmitStep } from './submit-step';
import { paths } from '../../../core/routing/paths';

/** What a refused rule asks for, and the action that fixes the first one. */
export function failureText(key: ChecklistKey): string {
  switch (key) {
    case 'email':
      return $localize`:@@submit.failEmail:Verify your email address`;
    case 'name':
      return $localize`:@@submit.failName:Add your business name`;
    case 'description':
      return $localize`:@@submit.failDescription:Write a description of 50 to 2,000 characters`;
    case 'cuisines':
      return $localize`:@@submit.failCuisines:Choose 1 to 5 cuisines, with one primary`;
    case 'areas':
      return $localize`:@@submit.failAreas:Choose the areas you serve, with one primary`;
    case 'guests':
      return $localize`:@@submit.failGuests:Add your guest range`;
    case 'occasions':
      return $localize`:@@submit.failOccasions:Choose at least one occasion`;
    case 'photos':
      return $localize`:@@submit.failPhotos:Add at least 3 photos`;
    case 'menu':
      return $localize`:@@submit.failMenu:Add at least 3 dishes`;
    case 'certificate':
      return $localize`:@@submit.failCertificate:Add your food handler certificate`;
  }
}

function fixAction(key: ChecklistKey): string {
  switch (key) {
    case 'email':
      return $localize`:@@submit.fixEmail:Go to account`;
    case 'name':
    case 'description':
      return $localize`:@@submit.fixDetails:Go to business details`;
    case 'cuisines':
    case 'areas':
      return $localize`:@@submit.fixCuisines:Go to cuisines and areas`;
    case 'guests':
    case 'occasions':
      return $localize`:@@submit.fixEvents:Go to guests and occasions`;
    case 'photos':
      return $localize`:@@submit.fixPhotos:Add photos`;
    case 'menu':
      return $localize`:@@submit.fixMenu:Add dishes`;
    case 'certificate':
      return $localize`:@@submit.fixCertificate:Add your certificate`;
  }
}

/**
 * Submit for review, its refusal and its thank-you (docs/mocks/dialogs/submit-profile;
 * submit-profile-for-review design, L2-039).
 */
@Component({
  selector: 'app-submit-dialog',
  imports: [RouterLink, Alert, Check, Dialog, Icon, Timeline, TimelineEntry],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './submit-dialog.html',
})
export class SubmitDialog {
  protected readonly paths = paths;
  private readonly injector = inject(Injector);

  readonly open = input(false);
  readonly step = input<SubmitStep>('confirm');
  readonly business = input.required<string>();
  readonly email = input.required<string>();
  readonly failures = input<readonly { key: ChecklistKey; detail: string | null }[]>([]);
  readonly busy = input(false);
  readonly failed = input(false);

  readonly confirmed = output<void>();
  readonly closed = output<void>();

  private readonly fix = viewChild<ElementRef<HTMLElement>>('fix');
  private readonly back = viewChild<ElementRef<HTMLElement>>('back');

  protected readonly notYet = $localize`:@@submit.notYet:Not yet`;
  protected readonly closeText = $localize`:@@common.close:Close`;
  protected readonly stepNow = $localize`:@@submit.stepNowText:Your profile is read-only while we look at it.`;
  protected readonly href = (key: ChecklistKey) => RULE_HREF[key];
  protected readonly text = failureText;

  protected readonly title = computed(() => {
    switch (this.step()) {
      case 'invalid':
        return $localize`:@@submit.notReady:Your profile isn’t ready yet`;
      case 'success':
        return $localize`:@@submit.thanks:Thanks — we’ll review your profile within 3 business days`;
      default:
        return $localize`:@@submit.confirmTitle:Submit ${this.business()}:business: for review?`;
    }
  });
  protected readonly description = computed(() => {
    switch (this.step()) {
      case 'invalid':
        return $localize`:@@submit.notReadyText:We can only review profiles that meet every rule.`;
      case 'success':
        return $localize`:@@submit.nowPending:Your profile is now pending review.`;
      default:
        return $localize`:@@submit.confirmText:Our team checks every new profile within 3 business days and emails you the result.`;
    }
  });
  protected readonly tone = computed(() => (this.step() === 'invalid' ? 'warning' : this.step() === 'success' ? 'success' : 'info'));
  protected readonly busyMessage = computed(() => $localize`:@@submit.busy:Submitting ${this.business()}:business: for review`);
  protected readonly summaryTitle = computed(() => {
    const n = this.failures().length;
    return n === 1 ? $localize`:@@submit.oneLeft:1 section still needs work` : $localize`:@@submit.manyLeft:${n}:count: sections still need work`;
  });
  protected readonly fixLabel = computed(() => fixAction(this.failures()[0]?.key ?? 'photos'));
  protected readonly stepEmail = computed(() => $localize`:@@submit.stepEmail:We email ${this.email()}:email: with the result.`);
  protected readonly stepApproved = computed(() => $localize`:@@submit.stepApprovedText:${this.business()}:business: appears in the listing within a minute.`);

  /** The panel's content changed while open: focus its main action (dialog D-8). */
  focusAction(): void {
    afterNextRender(() => (this.fix() ?? this.back())?.nativeElement.focus(), { injector: this.injector });
  }
}

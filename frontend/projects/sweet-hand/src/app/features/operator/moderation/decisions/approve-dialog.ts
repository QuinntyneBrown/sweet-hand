import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, ButtonAnchor, Checklist, ChecklistItem, Dialog, type CheckStatusLabels } from '@sweet-hand/components';
import { problemOf } from '../../../../core/forms/problem';
import { fullDate } from '../moderation-text';
import { conflictText } from './decision-text';
import { type DecisionResult, OperatorModerationService, type ProfileReviewView } from '@sweet-hand/api';

/** "Approve Auntie Bev's Kitchen?" for a submission or a name change (decide-profile-approval design; docs/mocks/dialogs/approve-profile). */
@Component({
  selector: 'app-approve-dialog',
  imports: [Alert, ButtonAnchor, Checklist, ChecklistItem, Dialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './approve-dialog.html',
})
export class ApproveDialog {
  private readonly api = inject(OperatorModerationService);

  readonly open = input(false);
  readonly review = input.required<ProfileReviewView>();
  readonly returnFocus = input<HTMLElement | null>(null);
  readonly dismissed = output<void>();
  readonly done = output<DecisionResult>();

  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly conflict = signal<string | null>(null);
  protected readonly tryAgain = $localize`:@@common.tryAgain:Try again`;
  protected readonly checkLabels: CheckStatusLabels = { done: '', missing: '', attention: '' };

  private readonly isName = computed(() => this.review().kind === 'name-change');
  protected readonly photo = computed(() => {
    const r = this.review();
    return (r.kind === 'submission' ? r.cover : r.card.photo) || null;
  });
  protected readonly title = computed(() => {
    const r = this.review();
    return $localize`:@@approve.title:Approve ${r.kind === 'name-change' ? r.newName : r.name}:name:?`;
  });
  protected readonly description = computed(() => {
    const r = this.review();
    if (r.kind === 'name-change')
      return $localize`:@@approve.nameDescription:The public page shows the new name within a minute and /caterers/${r.slug}:slug: redirects to /caterers/${r.newSlug}:newSlug:. ${r.owner}:owner: gets an email.`;
    return $localize`:@@approve.description:The profile appears in the listing within a minute, and ${r.contact.name}:owner: gets an email with a link to the public page.`;
  });
  protected readonly lines = computed(() => {
    const r = this.review();
    const audited = $localize`:@@approve.audited:Recorded in the audit log under your name`;
    if (r.kind === 'name-change') return [$localize`:@@approve.redirects:The old address redirects to the new one`, audited];
    const lines = [$localize`:@@approve.rulesPass:All submission rules pass`];
    if (r.certificate) lines.push($localize`:@@approve.certificateValid:Certificate valid until ${fullDate(r.certificate.expires)}:date:`);
    lines.push(audited);
    return lines;
  });
  protected readonly submitLabel = computed(() => (this.isName() ? $localize`:@@review.approveName:Approve name` : $localize`:@@review.approve:Approve and publish`));
  protected readonly busyMessage = computed(() => $localize`:@@approve.busy:Approving ${this.review().name}:name:`);
  protected readonly failedTitle = computed(() =>
    this.isName() ? $localize`:@@approve.nameFailedTitle:We couldn’t approve the name` : $localize`:@@approve.failedTitle:We couldn’t approve the profile`,
  );
  protected readonly failedText = computed(() =>
    this.isName()
      ? $localize`:@@approve.nameFailedText:The current name is still live and nothing was changed. Try again in a moment.`
      : $localize`:@@approve.failedText:It is still pending and nothing was published. Try again in a moment.`,
  );

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        this.failed.set(false);
        this.conflict.set(null);
      });
    });
  }

  protected async approve(): Promise<void> {
    if (this.busy() || this.conflict()) return;
    const r = this.review();
    this.failed.set(false);
    this.busy.set(true);
    try {
      this.done.emit(await firstValueFrom(r.kind === 'name-change' ? this.api.approveName(r.id) : this.api.approve(r.id)));
    } catch (e) {
      const { status, problem } = problemOf(e);
      if (status === 409) this.conflict.set(conflictText(r.name, problem));
      else this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}

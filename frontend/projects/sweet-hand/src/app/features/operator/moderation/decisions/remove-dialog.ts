import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, ButtonAnchor, Checklist, ChecklistItem, Dialog, FormField, FormSummary, Icon, Textarea, type CheckStatusLabels, type SummaryItem } from '@sweet-hand/components';
import { count } from '../../../../core/format/format';
import { summaryFrom, summaryHeading } from '../../../../core/forms/validation';
import { firstName } from '../moderation-text';
import { conflictText, reasonError } from './decision-text';
import { type CatererRecordView, type DecisionResult, OperatorModerationService } from '@sweet-hand/api';
import { FormDialogState } from '../../../../core/forms/form-dialog-state';
import { applyProblem } from '../../../../core/forms/problem';

/**
 * "Remove Pelau House permanently?" with a reason and the business name typed
 * to confirm (suspend-reinstate-remove-profile design; docs/mocks/dialogs/remove-caterer).
 * The button stays aria-disabled until the name matches; pressing it still says what is missing.
 */
@Component({
  selector: 'app-remove-dialog',
  imports: [Alert, ButtonAnchor, Checklist, ChecklistItem, Dialog, FormField, FormSummary, Icon, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './remove-dialog.html',
})
export class RemoveDialog {
  private readonly api = inject(OperatorModerationService);

  readonly open = input(false);
  readonly record = input.required<CatererRecordView>();
  readonly returnFocus = input<HTMLElement | null>(null);
  readonly dismissed = output<void>();
  readonly done = output<DecisionResult>();

  protected readonly reason = signal('');
  protected readonly confirm = signal('');
  protected readonly conflict = signal<string | null>(null);
  protected readonly state = new FormDialogState<{ reason: string | null; confirm: string | null }>(this.open, {
    noErrors: { reason: null, confirm: null },
    reset: () => {
      this.reason.set('');
      this.confirm.set('');
      this.conflict.set(null);
    },
  });
  protected readonly noLabels: CheckStatusLabels = { done: '', missing: '', attention: '' };

  protected readonly matches = computed(() => this.confirm() === this.record().name);
  protected readonly title = computed(() => $localize`:@@remove.title:Remove ${this.record().name}:name: permanently?`);
  protected readonly reasonLabel = computed(() => $localize`:@@decision.reasonFor:Reason (sent to ${firstName(this.record().owner.name)}:name:)`);
  protected readonly busyMessage = computed(() => $localize`:@@remove.busy:Removing ${this.record().name}:name:`);
  protected readonly failedTitle = computed(() => $localize`:@@remove.failedTitle:We couldn’t remove ${this.record().name}:name:`);
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@remove.action:remove ${this.record().name}:name:`));
  protected readonly summary = computed<SummaryItem[]>(() => {
    return summaryFrom(this.state.errors(), { reason: 'reason', confirm: 'confirm-name' });
  });
  protected readonly lines = computed(() => {
    const r = this.record();
    const reviews = r.activity.rating.count;
    const photos = r.profile.photos.length;
    const open = r.activity.openEnquiries;
    const lines = [$localize`:@@remove.lineGone:Its page returns “gone” and links back to the listing.`];
    if (reviews || photos) {
      const rv = reviews === 1 ? $localize`:@@remove.oneReview:1 review` : $localize`:@@remove.reviews:${count(reviews)}:count: reviews`;
      const ph = photos === 1 ? $localize`:@@remove.onePhoto:1 photo` : $localize`:@@remove.photos:${count(photos)}:count: photos`;
      lines.push($localize`:@@remove.lineShown:${rv}:reviews: and ${ph}:photos: stop showing within a minute.`);
    }
    if (open === 1) lines.push($localize`:@@remove.lineOneEnquiry:1 open enquiry closes; that customer is emailed.`);
    else if (open > 1) lines.push($localize`:@@remove.lineEnquiries:${open}:count: open enquiries close; those customers are emailed.`);
    lines.push($localize`:@@remove.lineExport:${firstName(r.owner.name)}:name: can still sign in to export their enquiry history.`);
    return lines;
  });

  protected async remove(): Promise<void> {
    if (this.state.busy() || this.conflict()) return;
    const name = this.record().name;
    const errors = {
      reason: reasonError(this.reason()),
      confirm: this.matches() ? null : $localize`:@@remove.nameMismatch:Type the business name exactly: ${name}:name:`,
    };
    if (!this.state.validate(errors)) return;
    await this.state.submit(
      async () => this.done.emit(await firstValueFrom(this.api.remove(this.record().id, this.reason().trim(), this.confirm()))),
      (status, problem) => {
        if (applyProblem(this.state, status, problem, ['reason', 'confirm'])) return true;
        if (status !== 409) return false;
        this.conflict.set(conflictText(name, problem));
        return true;
      },
    );
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Alert, BackLink, Button, Checklist, ChecklistItem, EMPTY_STATE, Icon, PhotoRow, Status, ToastNotifier, type CheckStatusLabels } from '@sweet-hand/components';
import { problemOf, reference } from '../../../../core/forms/problem';
import { summaryHeading } from '../../../../core/forms/validation';
import { reasonError } from '../decisions/decision-text';
import { ReasonDialog } from '../decisions/reason-dialog';
import { RemoveDialog } from '../decisions/remove-dialog';
import { OperatorEditDialog } from '../decisions/operator-edit-dialog';
import type { EditOutcome } from '../decisions/edit-outcome';
import { shortDate } from '../../../../core/format/format';
import { Session } from '../../../../core/session/session';
import { guestRange } from '../../../discovery/caterer/caterer-view';
import { openCertificate } from '../certificate-link';
import { dayTime, firstName, fullDate, profileStatusLabel, profileStatusTone } from '../moderation-text';
import {
  copyLabel,
  dishCount,
  enquiryLine,
  expiredText,
  expiredTitle,
  historyNote,
  removedText,
  removedTitle,
  reportLine,
  reviewLine,
  suspendedText,
  suspendedTitle,
  withPrimary,
} from './record-view';
import { type CatererRecordView, type DecisionResult, OperatorModerationService } from '@sweet-hand/api';
import type { RecordDialog } from './record-dialog';
import { paths } from '../../../../core/routing/paths';

/**
 * One caterer's record for operators, /admin/caterers/:id
 * (suspend-reinstate-remove-profile and edit-profile-as-operator designs; docs/mocks/pages/admin-caterer).
 */
@Component({
  selector: 'app-caterer-record-page',
  imports: [RouterLink, Alert, BackLink, Button, Checklist, ChecklistItem, EMPTY_STATE, Icon, PhotoRow, Status, ReasonDialog, RemoveDialog, OperatorEditDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './caterer-record.page.html',
  styleUrl: './caterer-record.page.css',
})
export class CatererRecordPage {
  protected readonly paths = paths;
  private readonly api = inject(OperatorModerationService);
  private readonly session = inject(Session);
  private readonly toasts = inject(ToastNotifier);
  protected readonly noLabels: CheckStatusLabels = { done: '', missing: '', attention: '' };
  protected readonly admin = computed(() => !!this.session.user()?.admin);

  /** The caterer id from the route. */
  readonly id = input.required<string>();

  protected readonly record = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.api.caterer(params),
  });
  protected readonly view = computed<CatererRecordView | undefined>(() => (this.record.hasValue() ? this.record.value() : undefined));
  protected readonly failed = computed(() => !!this.record.error() && !this.view());
  protected readonly errorReference = computed(() => reference(problemOf(this.record.error()).problem));

  protected readonly statusTone = profileStatusTone;
  protected readonly statusLabel = profileStatusLabel;
  protected readonly historyNote = historyNote;
  protected readonly dayTime = dayTime;
  protected readonly fullDate = fullDate;

  private readonly r = computed(() => this.view()!);
  protected readonly expired = computed(() => this.view()?.status === 'Published' && !!this.view()?.certificate?.expired);
  protected readonly expiredTitle = computed(() => expiredTitle(this.r()));
  protected readonly expiredText = computed(() => expiredText(this.r()));
  protected readonly suspendedTitle = computed(() => suspendedTitle(this.r()));
  protected readonly suspendedText = computed(() => suspendedText(this.r()));
  protected readonly removedTitle = computed(() => removedTitle(this.r()));
  protected readonly removedText = computed(() => removedText(this.r()));
  protected readonly nameWaiting = computed(
    () => $localize`:@@record.nameWaitingText:${this.r().name}:old: → ${this.r().pendingName ?? ''}:new:. The current name stays live until it’s approved.`,
  );
  protected readonly since = computed(() => shortDate(this.r().owner.since));
  protected readonly photos = computed(() => this.r().profile.photos.map((p) => ({ src: p.src, alt: p.alt, width: 72, height: 72 })));
  protected readonly cuisines = computed(() => withPrimary(this.r().profile.cuisines));
  protected readonly areas = computed(() => withPrimary(this.r().profile.areas));
  protected readonly guests = computed(() => guestRange(this.r().profile.minGuests, this.r().profile.maxGuests));
  protected readonly dishes = computed(() => dishCount(this.r().profile.dishes.length));
  protected readonly address = computed(() => paths.caterer(this.r().slug));
  protected readonly enquiries = computed(() => enquiryLine(this.r()));
  protected readonly reviews = computed(() => reviewLine(this.r()));
  protected readonly reports = computed(() => reportLine(this.r()));
  protected readonly copyLabel = computed(() => copyLabel(this.r().certificate?.fileName ?? '', this.r().certificate?.fileSize ?? null));
  protected readonly statement = computed(
    () =>
      $localize`:@@record.statement:The file opens through a link that expires after 5 minutes. ${firstName(this.r().owner.name)}:name:’s own statement; Sweet Hand doesn’t certify kitchens.`,
  );

  /** The open decision dialog and the button that opened it. */
  protected readonly dialog = signal<RecordDialog | null>(null);
  protected readonly opener = signal<HTMLElement | null>(null);

  /** A reason kept after the server did not answer, for Try again (admin-toast/danger). */
  protected readonly keptReason = signal('');

  protected openDialog(kind: RecordDialog, event: MouseEvent): void {
    this.opener.set(event.currentTarget as HTMLElement);
    this.keptReason.set('');
    this.dialog.set(kind);
  }

  protected readonly validateReason = reasonError;
  protected readonly suspendAction = (reason: string) => this.api.suspend(this.id(), reason);
  protected readonly reinstateAction = (reason: string) => this.api.reinstate(this.id(), reason);
  protected readonly reasonLabel = computed(() => $localize`:@@decision.reasonFor:Reason (sent to ${firstName(this.r().owner.name)}:name:)`);
  protected readonly suspendTitle = computed(() => $localize`:@@suspend.title:Suspend ${this.r().name}:name:?`);
  protected readonly suspendSummary = computed(() => summaryHeading(1, $localize`:@@suspend.action:suspend ${this.r().name}:name:`));
  protected readonly suspendBusy = computed(() => $localize`:@@suspend.busy:Suspending ${this.r().name}:name:`);
  protected readonly suspendFailed = computed(() => $localize`:@@suspend.failedTitle:We couldn’t suspend ${this.r().name}:name:`);
  protected readonly failedKept = $localize`:@@decision.failedKept:Nothing has changed. Check your connection and try again; your reason is kept.`;
  protected readonly suspendLines = computed(() => {
    const r = this.r();
    const first = firstName(r.owner.name);
    const open = r.activity.openEnquiries;
    return [
      $localize`:@@suspend.lineEmail:${first}:name: gets an email with your reason.`,
      open === 0
        ? $localize`:@@suspend.lineNoEnquiries:No open enquiries need closing.`
        : open === 1
          ? $localize`:@@suspend.lineOneEnquiry:1 open enquiry closes; that customer is told ${r.name}:business: is no longer available.`
          : $localize`:@@suspend.lineEnquiries:${open}:count: open enquiries close; those customers are told ${r.name}:business: is no longer available.`,
    ];
  });
  protected readonly reinstateTitle = computed(() => $localize`:@@reinstate.title:Reinstate ${this.r().name}:name:?`);
  protected readonly reinstateDescription = computed(() => {
    const r = this.r();
    const first = firstName(r.owner.name);
    const n = r.activity.rating.count;
    return n === 0
      ? $localize`:@@reinstate.descriptionNoReviews:It’s back in the listing within a minute. ${first}:name: gets an email.`
      : n === 1
        ? $localize`:@@reinstate.descriptionOneReview:It’s back in the listing within a minute, with its earlier review. ${first}:name: gets an email.`
        : $localize`:@@reinstate.description:It’s back in the listing within a minute, with its ${n}:count: earlier reviews. ${first}:name: gets an email.`;
  });
  protected readonly reinstateSummary = computed(() => summaryHeading(1, $localize`:@@reinstate.action:reinstate ${this.r().name}:name:`));
  protected readonly reinstateBusy = computed(() => $localize`:@@reinstate.busy:Reinstating ${this.r().name}:name:`);
  protected readonly reinstateFailed = computed(() => $localize`:@@reinstate.failedTitle:We couldn’t reinstate ${this.r().name}:name:`);

  /** After a status change the record shows the new state, and a toast says what happened. */
  protected changed(kind: 'suspended' | 'reinstated' | 'removed', result: DecisionResult): void {
    this.dialog.set(null);
    const first = firstName(result.owner);
    const toast =
      kind === 'suspended'
        ? { title: $localize`:@@suspend.toastTitle:${result.name}:name: is suspended`, text: $localize`:@@suspend.toastText:It leaves the listing within a minute. ${first}:name: has been emailed.` }
        : kind === 'reinstated'
          ? { title: $localize`:@@reinstate.toastTitle:${result.name}:name: is reinstated`, text: $localize`:@@reinstate.toastText:It’s back in the listing within a minute. ${first}:name: has been emailed.` }
          : { title: $localize`:@@remove.toastTitle:${result.name}:name: is removed`, text: $localize`:@@remove.toastText:Its page returns “gone” from now on. ${first}:name: has been emailed.` };
    this.toasts.show(toast);
    this.record.reload();
    void this.session.refresh();
  }

  /** An operator edit is live; removals below the minimums give the caterer 14 days (L2-057.1–2). */
  protected edited(outcome: EditOutcome): void {
    const r = this.r();
    const first = firstName(r.owner.name);
    this.dialog.set(null);
    const live = $localize`:@@edit.toastText:Live within a minute. ${first}:name: has been emailed your reason.`;
    if (outcome.kind === 'edit') {
      this.toasts.show({ title: $localize`:@@edit.toastTitle:Change saved`, text: live });
    } else {
      const title = outcome.kind === 'photo' ? $localize`:@@edit.photoRemoved:Photo removed` : $localize`:@@edit.dishRemoved:Dish removed`;
      const text = outcome.replaceBy
        ? $localize`:@@edit.belowMinimum:${r.name}:business: is below the minimum now. ${first}:name: has until ${shortDate(outcome.replaceBy)}:date: to add a replacement.`
        : live;
      this.toasts.show({ title, text });
    }
    this.record.reload();
  }

  /** The server did not answer: nothing changed; Try again reopens the dialog with the reason (admin-toast/danger). */
  protected unreachable(reason: string): void {
    const name = this.r().name;
    this.dialog.set(null);
    this.toasts.show({
      tone: 'danger',
      title: $localize`:@@suspend.unreachableTitle:Couldn’t suspend ${name}:name:`,
      text: $localize`:@@suspend.unreachableText:The server didn’t respond. Nothing was changed and the caterer wasn’t emailed.`,
      action: {
        label: $localize`:@@common.tryAgain:Try again`,
        run: () => {
          this.keptReason.set(reason);
          this.dialog.set('suspend');
        },
      },
    });
  }

  protected openCertificate(): void {
    openCertificate(this.api, this.id());
  }
}

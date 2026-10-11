import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  Alert,
  BackLink,
  Button,
  CatererCard,
  ChangedFlag,
  Checklist,
  ChecklistItem,
  Description,
  DescriptionList,
  Dish,
  DishList,
  EMPTY_STATE,
  Icon,
  InlineList,
  Status,
  ToastNotifier,
  type CheckStatusLabels,
} from '@sweet-hand/components';
import { Session } from '../../../../core/session/session';
import { problemOf } from '../../../../core/forms/problem';
import { ApproveDialog } from '../decisions/approve-dialog';
import { changeReasonError } from '../decisions/decision-text';
import { ReasonDialog } from '../decisions/reason-dialog';
import { DIETARY_LABELS } from '../../../discovery/caterer/dietary-labels';
import { guestRange } from '../../../discovery/caterer/caterer-view';
import { openCertificate } from '../certificate-link';
import { dayAtTime, dayTime, fullDate, profileStatusLabel, profileStatusTone, waitingInSentence } from '../moderation-text';
import { certificateFileLabel, historyLine, resubmittedText, ruleLines, submittedLine } from './profile-review-view';
import { type DecisionResult, type NameChangeReviewView, OperatorModerationService, type ProfileReviewView, type SubmissionReviewView } from '@sweet-hand/api';

/**
 * Reviewing a submitted profile or a business-name change, /admin/review/:id
 * (work-review-queue and decide-profile-approval designs; docs/mocks/pages/admin-profile-review).
 */
@Component({
  selector: 'app-profile-review-page',
  imports: [
    RouterLink,
    Alert,
    BackLink,
    Button,
    CatererCard,
    ChangedFlag,
    Checklist,
    ChecklistItem,
    Description,
    DescriptionList,
    Dish,
    DishList,
    EMPTY_STATE,
    Icon,
    InlineList,
    Status,
    ApproveDialog,
    ReasonDialog,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-review.page.html',
  styleUrl: './profile-review.page.css',
})
export class ProfileReviewPage {
  private readonly api = inject(OperatorModerationService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastNotifier);
  private readonly session = inject(Session);

  /** The caterer id from the route. */
  readonly id = input.required<string>();

  protected readonly review = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.api.profileReview(params),
  });
  protected readonly view = computed<ProfileReviewView | undefined>(() => (this.review.hasValue() ? this.review.value() : undefined));
  protected readonly failed = computed(() => !!this.review.error() && !this.view());
  protected readonly notFound = computed(() => this.failed() && problemOf(this.review.error()).status === 404);
  protected readonly submission = computed(() => {
    const v = this.view();
    return v?.kind === 'submission' ? v : null;
  });
  protected readonly nameChange = computed(() => {
    const v = this.view();
    return v?.kind === 'name-change' ? v : null;
  });

  protected readonly tagLabels = DIETARY_LABELS;
  protected readonly checkLabels: CheckStatusLabels = {
    done: '',
    missing: $localize`:@@checklist.toDo:To do: `,
    attention: $localize`:@@checklist.needsAttention:Needs attention: `,
  };
  protected readonly statusTone = profileStatusTone;
  protected readonly statusLabel = profileStatusLabel;
  protected readonly historyLine = historyLine;
  protected readonly dayTime = dayTime;
  protected readonly fullDate = fullDate;

  protected readonly subline = computed(() => {
    const s = this.submission();
    return s ? submittedLine(s) : '';
  });
  protected readonly resubmittedText = computed(() => {
    const s = this.submission();
    return s ? resubmittedText(s) : '';
  });
  protected readonly rules = computed(() => {
    const s = this.submission();
    return s ? ruleLines(s.checks) : [];
  });
  protected readonly guests = computed(() => {
    const p = this.submission()?.profile;
    return p ? guestRange(p.minGuests, p.maxGuests) : '';
  });
  protected readonly fileLabel = computed(() => {
    const c = this.submission()?.certificate;
    return c?.fileName ? certificateFileLabel(c.fileName, c.fileSize) : '';
  });
  protected readonly nameLine = computed(() => {
    const n = this.nameChange();
    return n ? `${$localize`:@@review.nameChange:Name change`} · ${waitingInSentence(n.requestedAt)}` : '';
  });
  protected readonly requestedBy = computed(() => {
    const n = this.nameChange();
    return n ? `${n.requestedBy} · ${dayAtTime(n.requestedAt)}` : '';
  });
  protected readonly keepsShowing = computed(() => $localize`:@@review.keepsShowing:Until you decide, the public page keeps showing “${this.view()?.name ?? ''}:name:”.`);

  /** Which decision dialog is open. */
  protected readonly dialog = signal<'approve' | 'request-changes' | null>(null);
  protected readonly validateChanges = changeReasonError;
  protected readonly dialogPhoto = computed(() => {
    const v = this.view();
    return (v?.kind === 'submission' ? v.cover : v?.card.photo) || null;
  });
  protected readonly requestAction = (reason: string) => {
    const v = this.view()!;
    return v.kind === 'name-change' ? this.api.rejectName(v.id, reason) : this.api.requestChanges(v.id, reason);
  };
  protected readonly requestDescription = computed(() => {
    const v = this.view();
    if (!v) return '';
    return v.kind === 'name-change'
      ? $localize`:@@requestChanges.nameDescription:${v.owner}:owner: gets your reason by email. The current name stays on the public page.`
      : $localize`:@@requestChanges.description:${v.contact.name}:owner: gets your reason by email and sees it as a banner in the profile editor.`;
  });
  protected readonly requestTitle = computed(() => $localize`:@@requestChanges.title:Request changes to ${this.view()?.name ?? ''}:name:`);
  protected readonly requestBusy = $localize`:@@requestChanges.busy:Sending your request for changes`;
  protected readonly requestFailedTitle = $localize`:@@requestChanges.failedTitle:We couldn’t send your request`;
  protected readonly requestFailedText = computed(() => {
    const v = this.view();
    const owner = v ? (v.kind === 'name-change' ? v.owner : v.contact.name).split(' ')[0] : '';
    return v?.kind === 'name-change'
      ? $localize`:@@requestChanges.nameFailedText:The name change is still waiting and ${owner}:owner: hasn’t been emailed. Try again in a moment.`
      : $localize`:@@requestChanges.failedText:The profile is still pending and ${owner}:owner: hasn’t been emailed. Try again in a moment.`;
  });

  /** After a decision the queue shows what is left, with what happened (admin-toast/success). */
  protected approved(result: DecisionResult): void {
    const v = this.view();
    this.dialog.set(null);
    if (v?.kind === 'name-change') {
      this.toasts.show({
        title: $localize`:@@approve.nameToastTitle:${v.name}:old: is now ${result.name}:name:`,
        text: $localize`:@@approve.nameToastText:The public page shows the new name within a minute. ${result.owner}:owner: has been emailed.`,
        action: { label: $localize`:@@approve.viewPage:View page`, href: `/caterers/${result.slug}` },
      });
    } else {
      this.toasts.show({
        title: $localize`:@@approve.toastTitle:${result.name}:name: is published`,
        text: $localize`:@@approve.toastText:It appears in the listing within a minute. ${result.owner}:owner: has been emailed.`,
        action: { label: $localize`:@@approve.viewPage:View page`, href: `/caterers/${result.slug}` },
      });
    }
    this.backToQueue();
  }

  protected changesRequested(result: DecisionResult): void {
    this.dialog.set(null);
    this.toasts.show({
      title: $localize`:@@requestChanges.toastTitle:Changes requested from ${result.name}:name:`,
      text: $localize`:@@requestChanges.toastText:${result.owner}:owner: has been emailed your reason.`,
    });
    this.backToQueue();
  }

  private backToQueue(): void {
    void this.session.refresh();
    void this.router.navigateByUrl('/admin/queue');
  }

  protected openCertificate(): void {
    openCertificate(this.api, this.id());
  }

  protected path(slug: string): string {
    return `/caterers/${slug}`;
  }

  protected cardPhoto(n: NameChangeReviewView) {
    return { src: n.card.photo, srcset: '', alt: n.card.alt, width: 280, height: 280 };
  }

  protected isSubmission(v: ProfileReviewView): v is SubmissionReviewView {
    return v.kind === 'submission';
  }
}

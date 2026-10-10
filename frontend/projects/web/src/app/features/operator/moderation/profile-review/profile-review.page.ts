import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
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
  Icon,
  InlineList,
  Status,
  type CheckStatusLabels,
} from '@sweet-hand/components';
import { ModerationApi } from '../../../../core/api/operator-moderation-api';
import type { NameChangeReviewView, ProfileReviewView, SubmissionReviewView } from '../../../../core/api/operator-moderation.models';
import { DIETARY_LABELS } from '../../../discovery/caterer/dietary-labels';
import { guestRange } from '../../../discovery/caterer/caterer-view';
import { openCertificate } from '../certificate-link';
import { dayAtTime, dayTime, fullDate, profileStatusLabel, profileStatusTone, waitingInSentence } from '../moderation-text';
import { certificateFileLabel, historyLine, resubmittedText, ruleLines, submittedLine } from './profile-review-view';

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
    Icon,
    InlineList,
    Status,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-review.page.html',
  styleUrl: './profile-review.page.css',
})
export class ProfileReviewPage {
  private readonly api = inject(ModerationApi);

  /** The caterer id from the route. */
  readonly id = input.required<string>();

  protected readonly review = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.api.profileReview(params),
  });
  protected readonly view = computed<ProfileReviewView | undefined>(() => (this.review.hasValue() ? this.review.value() : undefined));
  protected readonly failed = computed(() => !!this.review.error() && !this.view());
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

  /** Which decision dialog is open (slices to come). */
  protected readonly dialog = signal<'approve' | 'request-changes' | null>(null);

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

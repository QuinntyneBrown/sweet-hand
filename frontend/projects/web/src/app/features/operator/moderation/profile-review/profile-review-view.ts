import type { CheckStatus } from '@sweet-hand/components';
import type { ReviewHistoryView, SubmissionChecks, SubmissionReviewView } from '../../../../core/api/operator-moderation.models';
import { count } from '../../../../core/format/format';
import { dayAtTime, fileSize, waitingInSentence } from '../moderation-text';
import { shortDate } from '../../../../core/format/format';

/** The sentence of one history entry (docs/mocks/pages/admin-profile-review). */
export function historyLine(h: ReviewHistoryView): string {
  const by = h.by ?? '';
  switch (h.step) {
    case 'created':
      return $localize`:@@review.historyCreated:Draft created`;
    case 'submitted':
      return $localize`:@@review.historySubmitted:Submitted for review by ${by}:name:`;
    case 'resubmitted':
      return $localize`:@@review.historyResubmitted:Resubmitted by ${by}:name:`;
    case 'changes-requested':
      return $localize`:@@review.historyChanges:Changes requested by ${by}:name:: “${h.reason ?? ''}:reason:”`;
    case 'published':
      return $localize`:@@review.historyPublished:Published by ${by}:name:`;
    case 'name-change-requested':
      return $localize`:@@review.historyNameChange:Name change requested by ${by}:name:`;
  }
}

/** "Submitted Wed 7 Oct at 2:10 p.m. · waiting 3 days" */
export function submittedLine(view: SubmissionReviewView, now: Date = new Date()): string {
  const when = dayAtTime(view.submittedAt, now);
  const waiting = waitingInSentence(view.submittedAt, now);
  return view.resubmitted
    ? $localize`:@@review.resubmittedLine:Resubmitted ${when}:when: · ${waiting}:waiting:`
    : $localize`:@@review.submittedLine:Submitted ${when}:when: · ${waiting}:waiting:`;
}

/** "Tomas Reyes on Mon 5 Oct: “…” 2 fields changed since." */
export function resubmittedText(view: SubmissionReviewView, now: Date = new Date()): string {
  const r = view.changesRequested;
  if (!r) return '';
  const fields =
    view.changedFields === 1
      ? $localize`:@@review.oneFieldChanged:1 field changed since.`
      : $localize`:@@review.fieldsChanged:${view.changedFields}:count: fields changed since.`;
  return $localize`:@@review.resubmittedText:${r.by}:name: on ${shortDate(r.at, now)}:date:: “${r.reason}:reason:” ${fields}:fields:`;
}

export interface RuleLine {
  text: string;
  status: CheckStatus;
}

/** The submission rules of L2-039, as the review screen lists them. */
export function ruleLines(checks: SubmissionChecks): RuleLine[] {
  const s = (ok: boolean): CheckStatus => (ok ? 'done' : 'attention');
  return [
    { text: $localize`:@@review.ruleEmail:Email verified`, status: s(checks.emailVerified) },
    {
      text:
        checks.photos === 1
          ? $localize`:@@review.rulePhoto:1 photo, each with a caption, cover chosen`
          : $localize`:@@review.rulePhotos:${count(checks.photos)}:count: photos, each with a caption, cover chosen`,
      status: s(checks.photosComplete),
    },
    {
      text: checks.dishes === 1 ? $localize`:@@review.ruleDish:1 dish` : $localize`:@@review.ruleDishes:${count(checks.dishes)}:count: dishes`,
      status: s(checks.dishes >= 3 && checks.dishes <= 50),
    },
    { text: $localize`:@@review.ruleDetails:Description, cuisines, areas, guests and occasions`, status: s(checks.detailsComplete) },
    { text: $localize`:@@review.ruleCertificate:Food handler certificate valid`, status: s(checks.certificateValid) },
  ];
}

/** "Open food-handler-certificate.pdf · 1.2 MB" */
export function certificateFileLabel(name: string, size: number | null): string {
  return size ? $localize`:@@review.openFileSized:Open ${name}:file: · ${fileSize(size)}:size:` : $localize`:@@review.openFile:Open ${name}:file:`;
}

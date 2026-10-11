import type { CatererRecordView, StatusChangeView } from '../../../../core/api/operator-moderation.models';
import { count, longDate, shortDate } from '../../../../core/format/format';
import { dayTime, firstName } from '../moderation-text';

/** The note under one status change (docs/mocks/pages/admin-caterer, "Status history"). */
export function historyNote(h: StatusChangeView): string {
  if (h.reason) return `“${h.reason}”`;
  switch (h.step) {
    case 'created':
      return $localize`:@@record.noteCreated:Account created`;
    case 'submitted':
      return $localize`:@@record.noteSubmitted:Submitted`;
    case 'resubmitted':
      return $localize`:@@record.noteResubmitted:Resubmitted`;
    case 'approved':
      return $localize`:@@record.noteApproved:Approved`;
    case 'reinstated':
      return $localize`:@@record.noteReinstated:Reinstated`;
    default:
      return '';
  }
}

/** "Wed 30 Sep 2026" */
function dayDate(value: string): string {
  const parts = longDate(value).split(' ');
  return `${parts[0].slice(0, 3)} ${parts[1]} ${parts[2].slice(0, 3)} ${parts[3]}`;
}

export function expiredTitle(r: CatererRecordView): string {
  return $localize`:@@record.expiredTitle:Food handler certificate expired on ${dayDate(r.certificate!.expires)}:date:`;
}

export function expiredText(r: CatererRecordView, now: Date = new Date()): string {
  const reminders = r.certificateReminders.map((d) => shortDate(d, now));
  const sent =
    reminders.length === 2
      ? $localize`:@@record.remindersTwo:Reminders went out on ${reminders[0]}:first: and ${reminders[1]}:second:.`
      : reminders.length === 1
        ? $localize`:@@record.reminderOne:A reminder went out on ${reminders[0]}:date:.`
        : '';
  const act = $localize`:@@record.expiredAct:The profile stays published until you act: suspend it, or wait for a new certificate.`;
  return sent ? `${sent} ${act}` : act;
}

export function suspendedTitle(r: CatererRecordView, now: Date = new Date()): string {
  return $localize`:@@record.suspendedTitle:Suspended since ${dayTime(r.suspension!.at, now)}:when:`;
}

export function suspendedText(r: CatererRecordView): string {
  const n = r.suspension!.closedEnquiries;
  const closed =
    n === 0
      ? $localize`:@@record.noEnquiriesClosed:No open enquiries needed closing.`
      : n === 1
        ? $localize`:@@record.oneEnquiryClosed:1 open enquiry was closed and the customer was emailed.`
        : $localize`:@@record.enquiriesClosed:${n}:count: open enquiries were closed and the customers were emailed.`;
  const hidden = $localize`:@@record.suspendedHidden:Hidden from the listing and its page returns “not found”.`;
  const owner = $localize`:@@record.suspendedOwner:${firstName(r.owner.name)}:name: can still sign in and see why.`;
  return `${hidden} ${closed} ${owner}`;
}

export function removedTitle(r: CatererRecordView, now: Date = new Date()): string {
  return $localize`:@@record.removedTitle:Removed on ${dayTime(r.removal!.at, now)}:when: This can’t be undone.`;
}

export function removedText(r: CatererRecordView): string {
  return $localize`:@@record.removedText:The page returns “gone” and links back to the listing. Reviews and photos are no longer shown. ${firstName(r.owner.name)}:name: can sign in to export their enquiry history but can’t edit the profile.`;
}

/** "Trinidadian & Tobagonian (primary), Guyanese" */
export function withPrimary(items: string[]): string {
  return items.map((x, i) => (i === 0 ? $localize`:@@record.primary:${x}:name: (primary)` : x)).join(', ');
}

export function dishCount(n: number): string {
  return n === 1 ? $localize`:@@record.oneDish:1 dish` : $localize`:@@record.dishes:${count(n)}:count: dishes`;
}

export function enquiryLine(r: CatererRecordView): string {
  const a = r.activity;
  const total = a.enquiries === 1 ? $localize`:@@record.oneEnquiry:1 enquiry` : $localize`:@@record.enquiries:${count(a.enquiries)}:count: enquiries`;
  return $localize`:@@record.enquiryLine:${total}:total: · ${count(a.openEnquiries)}:open: open`;
}

export function reviewLine(r: CatererRecordView): string {
  const { average, count: n } = r.activity.rating;
  if (!n) return $localize`:@@record.noReviews:No reviews yet`;
  const reviews = n === 1 ? $localize`:@@record.oneReview:1 review` : $localize`:@@record.reviews:${count(n)}:count: reviews`;
  return `${average.toFixed(1)} · ${reviews}`;
}

export function reportLine(r: CatererRecordView): string {
  const n = r.activity.openReports;
  return n === 0
    ? $localize`:@@record.noReports:No open reports`
    : n === 1
      ? $localize`:@@record.oneReport:1 open report`
      : $localize`:@@record.reports:${n}:count: open reports`;
}

/** "food-handler-certificate.pdf (1.2 MB)" */
export function copyLabel(name: string, size: number | null): string {
  return size ? `${name} (${(size / (1024 * 1024)).toFixed(1)} MB)` : name;
}

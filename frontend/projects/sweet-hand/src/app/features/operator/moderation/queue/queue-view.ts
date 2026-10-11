import type { QueueItemMedia, SegmentedItem } from '@sweet-hand/components';
import { count } from '../../../../core/format/format';
import { fullDate, profileStatusLabel, waitingFor } from '../moderation-text';

/** One row of the review queue as the page renders it (queue-item CRD). */
export interface QueueRow {
  id: string;
  href: string;
  title: string;
  renamedTo: string | null;
  media: QueueItemMedia;
  photo: { src: string; width: number; height: number } | null;
  wait: string;
  late: boolean;
  kind: string;
  meta: string;
}

/** Where each kind of item is decided. */
export function queueHref(item: QueueItemView): string {
  switch (item.kind) {
    case 'profile':
    case 'resubmitted':
    case 'name-change':
      return `/admin/review/${item.targetId}`;
    case 'certificate':
      return `/admin/caterers/${item.targetId}`;
    case 'reports':
      return `/admin/reports/${item.targetId}`;
    case 'held-review':
      return '/admin/reviews';
  }
}

function holdReason(reason: HoldReason): string {
  switch (reason) {
    case 'phone':
      return $localize`:@@queue.heldPhone:contains a phone number`;
    case 'email':
      return $localize`:@@queue.heldEmail:contains an email address`;
    case 'link':
      return $localize`:@@queue.heldLink:contains a web address`;
  }
}

function kindAndMeta(item: QueueItemView): { kind: string; meta: string } {
  switch (item.kind) {
    case 'profile':
      return { kind: $localize`:@@queue.kindProfile:New profile`, meta: `${item.cuisine} · ${item.area}` };
    case 'resubmitted':
      return { kind: $localize`:@@queue.kindResubmitted:Resubmitted`, meta: `${item.cuisine} · ${item.area}` };
    case 'name-change':
      return { kind: $localize`:@@queue.kindNameChange:Name change`, meta: profileStatusLabel(item.status) };
    case 'certificate':
      return {
        kind: $localize`:@@queue.kindCertificate:Certificate expired`,
        meta: item.status === 'Published' ? $localize`:@@queue.certificateMeta:${fullDate(item.expired)}:date: · still published` : fullDate(item.expired),
      };
    case 'reports': {
      const kind = item.count === 1 ? $localize`:@@queue.oneReport:1 report` : $localize`:@@queue.reports:${item.count}:count: reports`;
      const facts = item.hidden ? [$localize`:@@queue.hiddenAutomatically:hidden automatically`, ...item.reasons] : item.reasons;
      return { kind, meta: facts.join(' · ') };
    }
    case 'held-review':
      return { kind: $localize`:@@queue.kindHeldReview:Held review`, meta: holdReason(item.holdReason) };
  }
}

function media(item: QueueItemView): QueueItemMedia {
  if (item.kind === 'reports') return 'report';
  if (item.kind === 'held-review') return 'review';
  return item.photo ? 'photo' : 'placeholder';
}

export function queueRow(item: QueueItemView, now: Date = new Date()): QueueRow {
  return {
    id: item.id,
    href: queueHref(item),
    title: item.title,
    renamedTo: item.kind === 'name-change' ? item.newName : null,
    media: media(item),
    photo: item.photo ? { src: item.photo, width: 56, height: 56 } : null,
    wait: waitingFor(item.waitingSince, now),
    late: item.late,
    ...kindAndMeta(item),
  };
}

/** "7 waiting · oldest first · 1 waiting over 3 days", "3 reports · oldest first" */
export function queueSubtitle(view: QueuePageView, filter: QueueFilter | null): string {
  if (view.counts.all === 0) return $localize`:@@queue.nothingWaiting:Nothing waiting`;
  const n = view.total;
  switch (filter) {
    case 'profiles':
      return n === 1 ? $localize`:@@queue.oneProfile:1 profile · oldest first` : $localize`:@@queue.profiles:${count(n)}:count: profiles · oldest first`;
    case 'name-changes':
      return n === 1 ? $localize`:@@queue.oneNameChange:1 name change · oldest first` : $localize`:@@queue.nameChanges:${count(n)}:count: name changes · oldest first`;
    case 'certificates':
      return n === 1
        ? $localize`:@@queue.oneCertificate:1 expired certificate · oldest first`
        : $localize`:@@queue.certificates:${count(n)}:count: expired certificates · oldest first`;
    case 'reports':
      return n === 1 ? $localize`:@@queue.oneReportGroup:1 report · oldest first` : $localize`:@@queue.reportGroups:${count(n)}:count: reports · oldest first`;
    default: {
      const waiting = $localize`:@@queue.waiting:${count(n)}:count: waiting · oldest first`;
      return view.late ? `${waiting} · ${$localize`:@@queue.late:${count(view.late)}:count: waiting over 3 days`}` : waiting;
    }
  }
}

export function queueFilters(view: QueuePageView | undefined): SegmentedItem[] {
  const c = view?.counts;
  const items: SegmentedItem[] = [
    { value: 'all', label: $localize`:@@queue.filterAll:All`, count: c?.all ?? null, href: '/admin/queue' },
    { value: 'profiles', label: $localize`:@@queue.filterProfiles:Profiles`, count: c?.profiles ?? null, href: '/admin/queue?kind=profiles' },
    { value: 'name-changes', label: $localize`:@@queue.filterNameChanges:Name changes`, count: c?.nameChanges ?? null, href: '/admin/queue?kind=name-changes' },
    { value: 'certificates', label: $localize`:@@queue.filterCertificates:Certificates`, count: c?.certificates ?? null, href: '/admin/queue?kind=certificates' },
    { value: 'reports', label: $localize`:@@queue.filterReports:Reports`, count: c?.reports ?? null, href: '/admin/queue?kind=reports' },
  ];
  if (c?.heldReviews) items.push({ value: 'held-reviews', label: $localize`:@@queue.filterHeldReviews:Held reviews`, count: c.heldReviews, href: '/admin/reviews' });
  return items;
}

/** The sentence of the "New in the queue" toast (admin-toast/info). */
export function arrivalText(item: QueueItemView): { text: string; action: string } {
  switch (item.kind) {
    case 'reports': {
      const reason = item.reasons[item.reasons.length - 1] ?? '';
      const lower = reason.charAt(0).toLowerCase() + reason.slice(1);
      return { text: $localize`:@@queue.arrivedReport:${item.title}:name: was reported for a ${lower}:reason:.`, action: $localize`:@@queue.openReport:Open report` };
    }
    case 'profile':
    case 'resubmitted':
      return { text: $localize`:@@queue.arrivedProfile:${item.title}:name: was submitted for review.`, action: $localize`:@@queue.openProfile:Open profile` };
    case 'name-change':
      return { text: $localize`:@@queue.arrivedName:${item.title}:name: asked to be renamed ${item.newName}:newName:.`, action: $localize`:@@queue.openProfile:Open profile` };
    case 'certificate':
      return { text: $localize`:@@queue.arrivedCertificate:${item.title}:name:’s food handler certificate has expired.`, action: $localize`:@@queue.openRecord:Open record` };
    case 'held-review':
      return { text: $localize`:@@queue.arrivedHeld:${item.title}:name: was held for review.`, action: $localize`:@@queue.openReviews:Open reviews` };
  }
}

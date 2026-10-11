import { shortDate, time, torontoToday } from '../../../core/format/format';
import type { ReviewStatusTone } from '@sweet-hand/components';
import { ModeratedReview, ModerationAction, ModerationList, ModerationStatus } from '@sweet-hand/api';

/** "Today, 7:58 a.m.", "Yesterday, 9:14 p.m." or "Thu 8 Oct, 4:12 p.m." in Toronto. */
export function moderationTime(at: string, now: Date = new Date()): string {
  const day = torontoToday(new Date(at));
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (day === torontoToday(now)) return $localize`:@@audit.today:Today, ${time(at)}:time:`;
  if (day === torontoToday(yesterday)) return $localize`:@@reviewsAdmin.yesterday:Yesterday, ${time(at)}:time:`;
  return $localize`:@@audit.onDay:${shortDate(at, now)}:date:, ${time(at)}:time:`;
}

/** The status line on a held or hidden review (docs/mocks/pages/admin-reviews). */
export function moderationStatus(r: ModeratedReview, now: Date = new Date()): { tone: ReviewStatusTone; label: string; time: string } {
  const when = moderationTime(r.at, now);
  if (r.status === 'Held') {
    const label =
      r.held?.reason === 'phone'
        ? $localize`:@@reviewsAdmin.heldPhone:Held · contains a phone number`
        : r.held?.reason === 'email'
          ? $localize`:@@reviewsAdmin.heldEmail:Held · contains an email address`
          : $localize`:@@reviewsAdmin.heldLink:Held · contains a link`;
    return { tone: 'held', label, time: when };
  }
  const h = r.hidden;
  if (h?.by) return { tone: 'hidden', label: $localize`:@@reviewsAdmin.hiddenBy:Hidden by ${h.by}:name:`, time: h.reason ? `${h.reason} · ${when}` : when };
  if (h && h.reports > 0) {
    const label = h.reports === 1 ? $localize`:@@reviewsAdmin.hiddenAutoOne:Hidden automatically · 1 report` : $localize`:@@reviewsAdmin.hiddenAuto:Hidden automatically · ${h.reports}:count: reports`;
    return { tone: 'hidden', label, time: when };
  }
  return { tone: 'hidden', label: $localize`:@@reviewsAdmin.hidden:Hidden`, time: when };
}

/** "2 held for a check · 2 hidden", or "Nothing waiting". */
export function moderationSubtitle(list: ModerationList): string {
  if (!list.held && !list.hidden) return $localize`:@@reviewsAdmin.nothingWaiting:Nothing waiting`;
  return $localize`:@@reviewsAdmin.subtitle:${list.held}:held: held for a check · ${list.hidden}:hidden: hidden`;
}

/** "1 held review matches “priya”" for a search (L2-067.5). */
export function searchCount(status: ModerationStatus, n: number, q: string): string {
  if (status === 'Held') {
    if (!n) return $localize`:@@reviewsAdmin.noHeldMatch:No held reviews match “${q}:q:”`;
    return n === 1 ? $localize`:@@reviewsAdmin.heldMatchOne:1 held review matches “${q}:q:”` : $localize`:@@reviewsAdmin.heldMatch:${n}:count: held reviews match “${q}:q:”`;
  }
  if (!n) return $localize`:@@reviewsAdmin.noHiddenMatch:No hidden reviews match “${q}:q:”`;
  return n === 1 ? $localize`:@@reviewsAdmin.hiddenMatchOne:1 hidden review matches “${q}:q:”` : $localize`:@@reviewsAdmin.hiddenMatch:${n}:count: hidden reviews match “${q}:q:”`;
}

/** The decisions a review's status allows (moderate-reviews: review status transitions). */
export function actionsFor(status: ModerationStatus): ModerationAction[] {
  return status === 'Held' ? ['approve', 'hide', 'remove'] : ['restore', 'remove'];
}

/** The toast after a decision is saved. */
export function decisionToast(action: ModerationAction, r: ModeratedReview): { title: string; text: string } {
  switch (action) {
    case 'approve':
      return {
        title: $localize`:@@moderate.approvedTitle:${r.reviewer}:reviewer:’s review is published`,
        text: $localize`:@@moderate.approvedText:It appears on ${r.catererName}:caterer:’s page within a minute.`,
      };
    case 'hide':
      return {
        title: $localize`:@@moderate.hiddenTitle:${r.reviewer}:reviewer:’s review stays hidden`,
        text: $localize`:@@moderate.emailed:${r.reviewer}:reviewer: is emailed your reason.`,
      };
    case 'restore':
      return {
        title: $localize`:@@moderate.restoredTitle:${r.reviewer}:reviewer:’s review is restored`,
        text: $localize`:@@moderate.restoredText:It’s back on ${r.catererName}:caterer:’s page within a minute.`,
      };
    case 'remove':
      return {
        title: $localize`:@@moderate.removedTitle:${r.reviewer}:reviewer:’s review is removed`,
        text: $localize`:@@moderate.removedText:Only its audit entry is kept.`,
      };
  }
}

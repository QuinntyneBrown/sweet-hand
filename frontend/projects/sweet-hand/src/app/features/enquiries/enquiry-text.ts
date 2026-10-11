/**
 * Words and formats for enquiries, shared by the customer and caterer views
 * (inbox-row and message CRDs, "Content and internationalisation").
 * Everything is in America/Toronto and comes from the resource files.
 */
import type { StatusTone } from '@sweet-hand/components';
import { count, shortDate, time, torontoToday } from '../../core/format/format';
import { EnquiryStatus, InboxCounts, InboxFilter, InboxRowView, Party } from '@sweet-hand/api';

export const FILTERS: InboxFilter[] = ['open', 'replied', 'declined', 'closed'];

export function readFilter(value: string | null): InboxFilter | null {
  return FILTERS.includes(value as InboxFilter) ? (value as InboxFilter) : null;
}

export function readPage(value: string | null): number {
  const n = Number(value ?? '1');
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export function statusTone(status: EnquiryStatus): Extract<StatusTone, 'open' | 'replied' | 'declined' | 'closed'> {
  return status.toLowerCase() as 'open' | 'replied' | 'declined' | 'closed';
}

export function statusLabel(status: EnquiryStatus | InboxFilter): string {
  switch (status.toLowerCase()) {
    case 'open':
      return $localize`:@@enquiry.status.open:Open`;
    case 'replied':
      return $localize`:@@enquiry.status.replied:Replied`;
    case 'declined':
      return $localize`:@@enquiry.status.declined:Declined`;
    default:
      return $localize`:@@enquiry.status.closed:Closed`;
  }
}

/** Days between two Toronto calendar dates (YYYY-MM-DD). */
function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

/** Last activity in a row: "9:42 a.m." today, "Yesterday", "Thu" in the last 6 days, then "Tue 6 Oct" (inbox-row CRD). */
export function activityTime(iso: string, now: Date = new Date()): string {
  const days = daysBetween(torontoToday(new Date(iso)), torontoToday(now));
  if (days <= 0) return time(iso);
  if (days === 1) return $localize`:@@enquiry.yesterday:Yesterday`;
  if (days < 7) return shortDate(iso, now).split(' ')[0];
  return shortDate(iso, now);
}

/** Message meta: "Today, 9:42 a.m." or "Fri 9 Oct, 4:15 p.m." (message CRD). */
export function messageTime(iso: string, now: Date = new Date()): string {
  const day = torontoToday(new Date(iso)) === torontoToday(now) ? $localize`:@@enquiry.today:Today` : shortDate(iso, now);
  return `${day}, ${time(iso)}`;
}

export function guestsText(n: number): string {
  return n === 1 ? $localize`:@@enquiry.guest:1 guest` : $localize`:@@enquiry.guests:${count(n)}:count: guests`;
}

/** "Sat 21 Nov · 120 guests", with the occasion on the caterer's side. */
export function rowSummary(row: InboxRowView, viewer: Party, now: Date = new Date()): string {
  const parts = [shortDate(row.eventDate, now), guestsText(row.guests)];
  if (viewer === 'caterer') parts.push(row.occasion);
  return parts.join(' · ');
}

export const FORMER_USER = (): string => $localize`:@@enquiry.formerUser:Former Sweet Hand user`;

export function rowName(row: InboxRowView): string {
  return row.otherParty.kind === 'former' ? FORMER_USER() : row.otherParty.name;
}

/** "4 enquiries · 1 unread" */
export function inboxSubtitle(counts: InboxCounts, unread: number): string {
  const all = counts.all === 1 ? $localize`:@@inbox.enquiry:1 enquiry` : $localize`:@@inbox.enquiries:${count(counts.all)}:count: enquiries`;
  return `${all} · ${$localize`:@@inbox.unreadCount:${count(unread)}:count: unread`}`;
}

/** "1 open enquiry", "0 closed enquiries": announced after the customer filters (L2-067.5). */
export function filteredSubtitle(filter: InboxFilter, total: number): string {
  const n = count(total);
  const one = total === 1;
  switch (filter) {
    case 'open':
      return one ? $localize`:@@inbox.openOne:1 open enquiry` : $localize`:@@inbox.openMany:${n}:count: open enquiries`;
    case 'replied':
      return one ? $localize`:@@inbox.repliedOne:1 replied enquiry` : $localize`:@@inbox.repliedMany:${n}:count: replied enquiries`;
    case 'declined':
      return one ? $localize`:@@inbox.declinedOne:1 declined enquiry` : $localize`:@@inbox.declinedMany:${n}:count: declined enquiries`;
    default:
      return one ? $localize`:@@inbox.closedOne:1 closed enquiry` : $localize`:@@inbox.closedMany:${n}:count: closed enquiries`;
  }
}

/** "2 open · 2 unread" on the caterer's enquiries. */
export function catererFilteredSubtitle(filter: InboxFilter, total: number, unread: number): string {
  const n = count(total);
  const status =
    filter === 'open'
      ? $localize`:@@enquiries.openCount:${n}:count: open`
      : filter === 'replied'
        ? $localize`:@@enquiries.repliedCount:${n}:count: replied`
        : filter === 'declined'
          ? $localize`:@@enquiries.declinedCount:${n}:count: declined`
          : $localize`:@@enquiries.closedCount:${n}:count: closed`;
  return `${status} · ${$localize`:@@inbox.unreadCount:${count(unread)}:count: unread`}`;
}

/** The no-results state for a status filter (inbox and enquiries mocks, `no-results`). */
export function noResults(filter: InboxFilter, viewer: Party): { heading: string; text: string } {
  const customer = viewer === 'customer';
  switch (filter) {
    case 'open':
      return {
        heading: $localize`:@@inbox.noOpen:No open enquiries`,
        text: customer
          ? $localize`:@@inbox.noOpenText:Enquiries waiting for a caterer’s first reply show here.`
          : $localize`:@@enquiries.noOpenText:New enquiries waiting for your first reply show here.`,
      };
    case 'replied':
      return {
        heading: $localize`:@@inbox.noReplied:No replied enquiries`,
        text: customer
          ? $localize`:@@inbox.noRepliedText:Enquiries a caterer has answered show here.`
          : $localize`:@@enquiries.noRepliedText:Enquiries you’ve answered show here.`,
      };
    case 'declined':
      return {
        heading: $localize`:@@inbox.noDeclined:No declined enquiries`,
        text: customer
          ? $localize`:@@inbox.noDeclinedText:Enquiries a caterer couldn’t take on show here.`
          : $localize`:@@enquiries.noDeclinedText:Enquiries you couldn’t take on show here.`,
      };
    default:
      return {
        heading: $localize`:@@inbox.noClosed:No closed enquiries`,
        text: customer
          ? $localize`:@@inbox.noClosedText:Enquiries close when you or the caterer close them, or 30 days after the event.`
          : $localize`:@@enquiries.noClosedText:Enquiries close when you or the customer close them, or 30 days after the event.`,
      };
  }
}

/** "Showing 1–20 of 25" */
export function pageSummary(page: number, pageSize: number, total: number): string {
  const from = count((page - 1) * pageSize + 1);
  const to = count(Math.min(total, page * pageSize));
  return $localize`:@@pagination.summary:Showing ${from}:from:–${to}:to: of ${count(total)}:total:`;
}

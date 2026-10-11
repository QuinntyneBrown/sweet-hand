import type { StatusTone } from '@sweet-hand/components';
import { count, shortDate, time, torontoToday } from '../../../core/format/format';
import { ProfileStatus } from '@sweet-hand/api';

/** Words, labels and small rules shared by the operator moderation screens. Messages come from the resource files. */

const DAY_MS = 24 * 3600_000;

export function readPage(value: string | null): number {
  const n = Number(value ?? '1');
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export function readQueueFilter(value: string | null): QueueFilter | null {
  return value === 'profiles' || value === 'name-changes' || value === 'certificates' || value === 'reports' ? value : null;
}

/** "Showing 1–20 of 34" */
export function pageSummary(page: number, pageSize: number, total: number): string {
  const from = count((page - 1) * pageSize + 1);
  const to = count(Math.min(total, page * pageSize));
  return $localize`:@@pagination.summary:Showing ${from}:from:–${to}:to: of ${count(total)}:total:`;
}

export const pageName = (page: number): string => $localize`:@@pagination.page:Page ${page}:page:`;

/** Calendar days between a moment and now, in Toronto. */
export function daysSince(iso: string, now: Date = new Date()): number {
  return Math.round((Date.parse(torontoToday(now)) - Date.parse(torontoToday(new Date(iso)))) / DAY_MS);
}

/** "Waiting 3 days", "Waiting 1 day", "Waiting 6 hours", "Waiting 40 min": relative and coarse (queue-item CRD). */
export function waitingFor(since: string, now: Date = new Date()): string {
  const days = daysSince(since, now);
  if (days >= 1) return days === 1 ? $localize`:@@queue.waitingDay:Waiting 1 day` : $localize`:@@queue.waitingDays:Waiting ${days}:count: days`;
  const minutes = Math.max(1, Math.round((now.getTime() - Date.parse(since)) / 60_000));
  if (minutes < 60) return $localize`:@@queue.waitingMinutes:Waiting ${minutes}:count: min`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? $localize`:@@queue.waitingHour:Waiting 1 hour` : $localize`:@@queue.waitingHours:Waiting ${hours}:count: hours`;
}

/** "waiting 3 days", "waiting 6 hours": the same, inside a sentence. */
export function waitingInSentence(since: string, now: Date = new Date()): string {
  const days = daysSince(since, now);
  if (days >= 1) return days === 1 ? $localize`:@@moderation.waitingDay:waiting 1 day` : $localize`:@@moderation.waitingDays:waiting ${days}:count: days`;
  const minutes = Math.max(1, Math.round((now.getTime() - Date.parse(since)) / 60_000));
  if (minutes < 60) return $localize`:@@moderation.waitingMinutes:waiting ${minutes}:count: min`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? $localize`:@@moderation.waitingHour:waiting 1 hour` : $localize`:@@moderation.waitingHours:waiting ${hours}:count: hours`;
}

/** "today", "Thu 8 Oct" for record rows: "updated today". */
export function updatedOn(iso: string, now: Date = new Date()): string {
  return daysSince(iso, now) === 0 ? $localize`:@@caterers.updatedToday:updated today` : $localize`:@@caterers.updatedOn:updated ${shortDate(iso, now)}:date:`;
}

/** "Wed 7 Oct at 2:10 p.m." */
export function dayAtTime(iso: string, now: Date = new Date()): string {
  return $localize`:@@moderation.dayAtTime:${shortDate(iso, now)}:date: at ${time(iso)}:time:`;
}

/** "Today, 8:15 a.m.", "Yesterday, 6:40 p.m.", "Thu 8 Oct, 2:05 p.m." */
export function relativeDayTime(iso: string, now: Date = new Date()): string {
  const days = daysSince(iso, now);
  if (days === 0) return $localize`:@@moderation.todayAt:Today, ${time(iso)}:time:`;
  if (days === 1) return $localize`:@@moderation.yesterdayAt:Yesterday, ${time(iso)}:time:`;
  return `${shortDate(iso, now)}, ${time(iso)}`;
}

/** "Fri 14 Mar 2025, 11:20 a.m." for timelines. */
export function dayTime(iso: string, now: Date = new Date()): string {
  return `${shortDate(iso, now)}, ${time(iso)}`;
}

/** "30 Sep 2026": certificate dates, always with the year. */
export function fullDate(value: string): string {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00-05:00`) : new Date(value);
  const p: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', day: 'numeric', month: 'short', year: 'numeric' }).formatToParts(d)) p[part.type] = part.value;
  return `${p['day']} ${p['month'].replace('.', '')} ${p['year']}`;
}

const STATUS_TONE: Record<ProfileStatus, StatusTone> = {
  Draft: 'draft',
  'Pending review': 'pending',
  'Changes requested': 'changes',
  Published: 'published',
  Suspended: 'suspended',
  Removed: 'removed',
};

export const profileStatusTone = (status: ProfileStatus): StatusTone => STATUS_TONE[status];

export function profileStatusLabel(status: ProfileStatus): string {
  switch (status) {
    case 'Draft':
      return $localize`:@@status.draft:Draft`;
    case 'Pending review':
      return $localize`:@@status.pendingReview:Pending review`;
    case 'Changes requested':
      return $localize`:@@status.changesRequested:Changes requested`;
    case 'Published':
      return $localize`:@@status.published:Published`;
    case 'Suspended':
      return $localize`:@@status.suspended:Suspended`;
    case 'Removed':
      return $localize`:@@status.removed:Removed`;
  }
}

/** "1.2 MB" */
export function fileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** First word of a name: "Kendra" from "Kendra Baptiste". */
export const firstName = (name: string): string => name.trim().split(/\s+/)[0];

import type { AuditEntryView } from '../../../core/api/operator-settings.models';
import { count, shortDate, time, torontoToday } from '../../../core/format/format';

/** The filter's action choices (docs/mocks/pages/admin-audit): a value is an action key or a group of keys. */
export const ACTION_FILTERS: { value: string; label: string }[] = [
  { value: 'Approve', label: $localize`:@@audit.approve:Approve` },
  { value: 'RequestChanges', label: $localize`:@@audit.requestChanges:Request changes` },
  { value: 'Edit', label: $localize`:@@audit.edit:Edit` },
  { value: 'Revert', label: $localize`:@@audit.revert:Revert` },
  { value: 'Suspend', label: $localize`:@@audit.suspend:Suspend` },
  { value: 'Reinstate', label: $localize`:@@audit.reinstate:Reinstate` },
  { value: 'Remove', label: $localize`:@@audit.remove:Remove` },
  { value: 'ApproveReview', label: $localize`:@@audit.approveReview:Approve review` },
  { value: 'HideReview', label: $localize`:@@audit.hideReview:Hide review` },
  { value: 'RestoreReview', label: $localize`:@@audit.restoreReview:Restore review` },
  { value: 'RemoveReview', label: $localize`:@@audit.removeReview:Remove review` },
  { value: 'resolve-report', label: $localize`:@@audit.resolveReport:Resolve report` },
  { value: 'EnquiryAccess', label: $localize`:@@audit.openEnquiry:Open enquiry` },
  { value: 'operator-account', label: $localize`:@@audit.operatorAccount:Operator account` },
  { value: 'cuisines', label: $localize`:@@audit.cuisineList:Cuisine list` },
  { value: 'RecordBreach', label: $localize`:@@audit.recordBreach:Record breach` },
];

/** How each stored action reads in the log (query-audit-log, AuditAction). */
const ACTION_LABELS: Record<string, string> = {
  ...Object.fromEntries(ACTION_FILTERS.map((a) => [a.value, a.label])),
  RemoveItem: $localize`:@@audit.removeItem:Remove item`,
  DismissReports: $localize`:@@audit.resolveReport:Resolve report`,
  ResolveReports: $localize`:@@audit.resolveReport:Resolve report`,
  CreateOperator: $localize`:@@audit.operatorAccount:Operator account`,
  DeactivateOperator: $localize`:@@audit.operatorAccount:Operator account`,
  AddCuisine: $localize`:@@audit.addCuisine:Add cuisine`,
  RetireCuisine: $localize`:@@audit.retireCuisine:Retire cuisine`,
};

export const actionLabel = (action: string) => ACTION_LABELS[action] ?? action;

/** "Today, 9:12 a.m." or "Fri 9 Oct, 4:30 p.m." in Toronto. */
export function auditWhen(at: string, now: Date = new Date()): string {
  return torontoToday(new Date(at)) === torontoToday(now)
    ? $localize`:@@audit.today:Today, ${time(at)}:time:`
    : $localize`:@@audit.onDay:${shortDate(at, now)}:date:, ${time(at)}:time:`;
}

/** "Published → Hidden", "— → Operator"; null when nothing changed. */
export function auditChange(e: AuditEntryView): string | null {
  if (e.before === null && e.after === null) return null;
  return `${e.before ?? '—'} → ${e.after ?? '—'}`;
}

/** "3 Oct" and "10 Oct 2026": the year once, unless the dates fall in different years. */
export function auditRange(from: string, to: string): { from: string; to: string } {
  const withYear = (d: string) => shortDate(d, new Date(0)).replace(/^\S+ /, '');
  const fromText = withYear(from);
  const toText = withYear(to);
  return { from: from.slice(0, 4) === to.slice(0, 4) ? fromText.replace(/ \d{4}$/, '') : fromText, to: toText };
}

/** "9 entries from 3 Oct to 10 Oct 2026 · times in Toronto" */
export function auditCount(total: number, from: string, to: string): string {
  const r = auditRange(from, to);
  return total === 1
    ? $localize`:@@audit.countOne:1 entry from ${r.from}:from: to ${r.to}:to: · times in Toronto`
    : $localize`:@@audit.count:${count(total)}:count: entries from ${r.from}:from: to ${r.to}:to: · times in Toronto`;
}

/** What an operator has not done, for "Tomas Reyes hasn’t removed anything between 3 Oct and 10 Oct 2026." */
const NOT_DONE: Record<string, (who: string, from: string, to: string) => string> = {
  Approve: (w, f, t) => $localize`:@@audit.none.approve:${w}:who: hasn’t approved anything between ${f}:from: and ${t}:to:.`,
  RequestChanges: (w, f, t) => $localize`:@@audit.none.requestChanges:${w}:who: hasn’t asked for changes between ${f}:from: and ${t}:to:.`,
  Edit: (w, f, t) => $localize`:@@audit.none.edit:${w}:who: hasn’t edited anything between ${f}:from: and ${t}:to:.`,
  Revert: (w, f, t) => $localize`:@@audit.none.revert:${w}:who: hasn’t reverted anything between ${f}:from: and ${t}:to:.`,
  Suspend: (w, f, t) => $localize`:@@audit.none.suspend:${w}:who: hasn’t suspended anything between ${f}:from: and ${t}:to:.`,
  Reinstate: (w, f, t) => $localize`:@@audit.none.reinstate:${w}:who: hasn’t reinstated anything between ${f}:from: and ${t}:to:.`,
  Remove: (w, f, t) => $localize`:@@audit.none.remove:${w}:who: hasn’t removed anything between ${f}:from: and ${t}:to:.`,
  ApproveReview: (w, f, t) => $localize`:@@audit.none.approveReview:${w}:who: hasn’t approved any reviews between ${f}:from: and ${t}:to:.`,
  HideReview: (w, f, t) => $localize`:@@audit.none.hideReview:${w}:who: hasn’t hidden any reviews between ${f}:from: and ${t}:to:.`,
  RestoreReview: (w, f, t) => $localize`:@@audit.none.restoreReview:${w}:who: hasn’t restored any reviews between ${f}:from: and ${t}:to:.`,
  RemoveReview: (w, f, t) => $localize`:@@audit.none.removeReview:${w}:who: hasn’t removed any reviews between ${f}:from: and ${t}:to:.`,
  'resolve-report': (w, f, t) => $localize`:@@audit.none.resolveReport:${w}:who: hasn’t resolved any reports between ${f}:from: and ${t}:to:.`,
  EnquiryAccess: (w, f, t) => $localize`:@@audit.none.openEnquiry:${w}:who: hasn’t opened any enquiries between ${f}:from: and ${t}:to:.`,
  'operator-account': (w, f, t) => $localize`:@@audit.none.operatorAccount:${w}:who: hasn’t changed any operator accounts between ${f}:from: and ${t}:to:.`,
  cuisines: (w, f, t) => $localize`:@@audit.none.cuisines:${w}:who: hasn’t changed the cuisine list between ${f}:from: and ${t}:to:.`,
  RecordBreach: (w, f, t) => $localize`:@@audit.none.recordBreach:${w}:who: hasn’t recorded any breaches between ${f}:from: and ${t}:to:.`,
};

export function noMatchText(operatorName: string | null, action: string, from: string, to: string): string {
  const r = auditRange(from, to);
  const sentence = operatorName && NOT_DONE[action];
  if (sentence) return sentence(operatorName, r.from, r.to);
  if (operatorName) return $localize`:@@audit.none.operator:${operatorName}:who: has no entries between ${r.from}:from: and ${r.to}:to:.`;
  return $localize`:@@audit.none.any:Nothing recorded between ${r.from}:from: and ${r.to}:to: matches these filters.`;
}

/** The week up to today: the filter's default dates. */
export function lastWeek(now: Date = new Date()): { from: string; to: string } {
  const to = torontoToday(now);
  const d = new Date(`${to}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 7);
  return { from: d.toISOString().slice(0, 10), to };
}

import type { OperatorAccount } from '../../../core/api/operator-settings.models';
import { shortDate, time, torontoToday } from '../../../core/format/format';

/** "today, 8:15 a.m." or "Fri 9 Oct, 4:30 p.m." */
function when(iso: string, now: Date): string {
  return torontoToday(new Date(iso)) === torontoToday(now)
    ? $localize`:@@operators.todayAt:today, ${time(iso)}:time:`
    : $localize`:@@operators.dayAt:${shortDate(iso, now)}:date:, ${time(iso)}:time:`;
}

/** "Admin · Authenticator app · Active now" (docs/mocks/pages/admin-operators/default.html). */
export function operatorMeta(a: OperatorAccount, now: Date = new Date()): string {
  const role = a.admin ? $localize`:@@operators.roleAdmin:Admin` : $localize`:@@operators.roleOperator:Operator`;
  if (a.status === 'Deactivated' && a.deactivatedAt) return $localize`:@@operators.deactivatedMeta:${role}:role: · Deactivated ${when(a.deactivatedAt, now)}:when:`;
  if (a.status === 'Invited' && a.invitedAt) return $localize`:@@operators.invitedMeta:${role}:role: · Invited ${when(a.invitedAt, now)}:when: · the link works for 24 hours`;
  const factor =
    a.secondFactor === 'security key'
      ? $localize`:@@operators.securityKey:Security key`
      : a.secondFactor === 'authenticator app'
        ? $localize`:@@operators.authenticator:Authenticator app`
        : $localize`:@@operators.noFactor:Second step not set up`;
  const activity = a.self
    ? $localize`:@@operators.activeNow:Active now`
    : a.lastActiveAt
      ? $localize`:@@operators.lastActive:Last active ${when(a.lastActiveAt, now)}:when:`
      : $localize`:@@operators.neverActive:Not signed in yet`;
  return `${role} · ${factor} · ${activity}`;
}

/** "2 operators · two-step verification for everyone": active accounts only. */
export function operatorsSubtitle(all: OperatorAccount[]): string {
  const n = all.filter((a) => a.status === 'Active').length;
  return n === 1
    ? $localize`:@@operators.subtitleOne:1 operator · two-step verification for everyone`
    : $localize`:@@operators.subtitle:${n}:count: operators · two-step verification for everyone`;
}

/** "Tomas" from "Tomas Reyes". */
export const firstName = (name: string) => name.split(/\s+/)[0] ?? name;

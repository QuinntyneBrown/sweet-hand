import { monthYear, shortDate, time, torontoToday } from '../../core/format/format';
import { type AccountView, type ActiveSession } from '@sweet-hand/api';

/** What the account page says, worked out from the API's data (docs/mocks/pages/account). */

/** "today, 8:15 a.m.", "yesterday, 9:03 p.m." or "Mon 28 Sep" (list CRD content rules). */
export function whenActive(iso: string, now: Date = new Date()): string {
  const day = torontoToday(new Date(iso));
  if (day === torontoToday(now)) return $localize`:@@account.today:today, ${time(iso)}:time:`;
  if (day === torontoToday(new Date(now.getTime() - 86_400_000))) return $localize`:@@account.yesterday:yesterday, ${time(iso)}:time:`;
  return shortDate(iso, now);
}

export function sessionMeta(session: ActiveSession, now: Date = new Date()): string {
  return session.current ? $localize`:@@account.thisDevice:This device · active now` : $localize`:@@account.lastActive:Last active ${whenActive(session.lastActiveAt, now)}:when:`;
}

/** Current session first, then the most recently used. */
export function orderSessions(sessions: readonly ActiveSession[]): ActiveSession[] {
  return [...sessions].sort((a, b) => Number(b.current) - Number(a.current) || b.lastActiveAt.localeCompare(a.lastActiveAt));
}

export function memberLine(account: AccountView): string {
  const since = monthYear(account.memberSince);
  switch (account.role) {
    case 'Caterer':
      return $localize`:@@account.catererSince:${account.displayName}:name: · Caterer account since ${since}:since:`;
    case 'Operator':
      return $localize`:@@account.operatorSince:${account.displayName}:name: · Operator since ${since}:since:`;
    default:
      return $localize`:@@account.customerSince:${account.displayName}:name: · Customer since ${since}:since:`;
  }
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

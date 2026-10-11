import type { SessionUser } from '../../../core/api/session.models';
import type { SiteNotice } from '../../../core/api/notices.models';
import { TIME_ZONE, time } from '../../../core/format/format';

/** The one banner under the header, most urgent first ("at most one banner per screen", alert CRD). */
export type Banner =
  | { kind: 'degraded' }
  | { kind: 'bounced'; email: string }
  | { kind: 'unverified'; email: string }
  | { kind: 'verified' }
  | { kind: 'maintenance'; id: string; startsAt: string; endsAt: string };

export interface BannerInputs {
  notices: readonly SiteNotice[];
  user: SessionUser | null;
  /** The email was verified while this page was open. */
  justVerified: boolean;
  dismissed: ReadonlySet<string>;
  /** Pages that show the email conditions themselves (the account page). */
  emailShownByPage: boolean;
}

export function pickBanner(i: BannerInputs): Banner | null {
  if (i.notices.some((n) => n.kind === 'degraded')) return { kind: 'degraded' };
  const customer = i.user?.role === 'Customer' ? i.user : null;
  if (customer && !i.emailShownByPage) {
    if (customer.emailBounced && !i.dismissed.has('bounced')) return { kind: 'bounced', email: customer.email };
    if (!customer.emailVerified) return { kind: 'unverified', email: customer.email };
  }
  if (i.justVerified && !i.dismissed.has('verified')) return { kind: 'verified' };
  const maintenance = i.notices.find((n): n is Extract<SiteNotice, { kind: 'maintenance' }> => n.kind === 'maintenance' && !i.dismissed.has(n.id));
  return maintenance ? { kind: 'maintenance', id: maintenance.id, startsAt: maintenance.startsAt, endsAt: maintenance.endsAt } : null;
}

/** "Sunday 18 October, 1:00–3:00 a.m." */
export function maintenanceWindow(startsAt: string, endsAt: string): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long' }).formatToParts(new Date(startsAt)).map((x) => [x.type, x.value]),
  );
  const from = time(startsAt);
  const until = time(endsAt);
  const samePeriod = from.slice(-4) === until.slice(-4);
  return `${p['weekday']} ${p['day']} ${p['month']}, ${samePeriod ? from.slice(0, -5) : from}–${until}`;
}

/** "two hours" */
export function duration(startsAt: string, endsAt: string): string {
  const hours = Math.max(1, Math.round((Date.parse(endsAt) - Date.parse(startsAt)) / 3_600_000));
  if (hours === 1) return $localize`:@@banner.anHour:an hour`;
  if (hours === 2) return $localize`:@@banner.twoHours:two hours`;
  return $localize`:@@banner.hours:${hours}:count: hours`;
}

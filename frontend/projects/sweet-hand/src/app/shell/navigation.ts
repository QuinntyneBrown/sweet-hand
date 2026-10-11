import type { FooterLink, SiteNavLink, SiteNavShortcut } from '@sweet-hand/components';
import { type SessionUser } from '@sweet-hand/api';
import { homeFor, paths } from '../core/routing/paths';

/** What the shell offers each role (site-header, site-menu and footer mocks). */

export interface MenuLink {
  label: string;
  href: string;
  current?: boolean;
  count?: number;
  countLabel?: string;
}

const isUnder = (url: string, href: string) => url === href || url.startsWith(href + '/') || url.startsWith(href + '?');

export function markCurrent<T extends { href: string; current?: boolean }>(links: T[], url: string): T[] {
  const path = url.split('#')[0];
  // The longest matching link is current, so /dashboard/enquiries beats /dashboard.
  const best = links.filter((l) => isUnder(path.split('?')[0], l.href)).sort((a, b) => b.href.length - a.href.length)[0];
  return links.map((l) => ({ ...l, current: l === best }));
}

const unreadEnquiries = (n: number) =>
  n === 1 ? $localize`:@@nav.unreadEnquiry:${n}:count: unread enquiry` : $localize`:@@nav.unreadEnquiries:${n}:count: unread enquiries`;
const unread = (n: number) => $localize`:@@nav.unread:${n}:count: unread`;
const waiting = (n: number) =>
  n === 1 ? $localize`:@@nav.itemWaiting:${n}:count: item waiting` : $localize`:@@nav.itemsWaiting:${n}:count: items waiting`;

export function homeHref(user: SessionUser | null): string {
  return homeFor(user?.role);
}

export function areaTag(user: SessionUser | null): string | null {
  if (user?.role === 'Caterer') return $localize`:@@header.tagCaterers:for caterers`;
  if (user?.role === 'Operator') return $localize`:@@header.tagOperator:Operator`;
  return null;
}

const catererPage = (user: SessionUser) =>
  user.caterer?.status === 'Published' ? paths.caterer(user.caterer.slug) : null;

export function headerLinks(user: SessionUser | null, unreadCount: number, queue: number): SiteNavLink[] {
  const caterers = $localize`:@@nav.caterers:Caterers`;
  switch (user?.role) {
    case 'Customer':
      return [
        { label: caterers, href: paths.caterers },
        { label: $localize`:@@nav.occasions:Occasions`, href: paths.occasions },
        { label: $localize`:@@nav.inbox:Inbox`, href: paths.inbox, count: unreadCount, countLabel: unreadEnquiries(unreadCount) },
      ];
    case 'Caterer': {
      const links: SiteNavLink[] = [
        { label: $localize`:@@nav.dashboard:Dashboard`, href: paths.dashboard.overview },
        { label: $localize`:@@nav.enquiries:Enquiries`, href: paths.dashboard.enquiries, count: unreadCount, countLabel: unread(unreadCount) },
      ];
      const page = catererPage(user);
      if (page) links.push({ label: $localize`:@@nav.myPage:My page`, href: page });
      return links;
    }
    case 'Operator':
      return [
        { label: $localize`:@@nav.queue:Queue`, href: paths.admin.queue, count: queue, countLabel: waiting(queue) },
        { label: caterers, href: paths.admin.caterers },
        { label: $localize`:@@nav.metrics:Metrics`, href: paths.admin.metrics },
      ];
    default:
      return [
        { label: caterers, href: paths.caterers },
        { label: $localize`:@@nav.occasions:Occasions`, href: paths.occasions },
        { label: $localize`:@@nav.signIn:Sign in`, href: paths.signIn },
      ];
  }
}

export function inboxShortcut(user: SessionUser | null, unreadCount: number): SiteNavShortcut | null {
  if (user?.role === 'Customer') return { label: $localize`:@@nav.inbox:Inbox`, href: paths.inbox, count: unreadCount, countLabel: unread(unreadCount) };
  if (user?.role === 'Caterer')
    return { label: $localize`:@@nav.enquiries:Enquiries`, href: paths.dashboard.enquiries, count: unreadCount, countLabel: unread(unreadCount) };
  return null;
}

export function siteMenuLinks(user: SessionUser | null, unreadCount: number, queue: number): MenuLink[] {
  switch (user?.role) {
    case 'Customer':
      return [
        { label: $localize`:@@nav.caterers:Caterers`, href: paths.caterers },
        { label: $localize`:@@nav.occasions:Occasions`, href: paths.occasions },
        { label: $localize`:@@nav.inbox:Inbox`, href: paths.inbox, count: unreadCount, countLabel: unreadEnquiries(unreadCount) },
        { label: $localize`:@@nav.account:Account`, href: paths.account },
      ];
    case 'Caterer': {
      const links: MenuLink[] = [
        { label: $localize`:@@nav.overview:Overview`, href: paths.dashboard.overview },
        { label: $localize`:@@nav.enquiries:Enquiries`, href: paths.dashboard.enquiries, count: unreadCount, countLabel: unread(unreadCount) },
        { label: $localize`:@@nav.businessDetails:Business details`, href: paths.dashboard.details },
        { label: $localize`:@@nav.cuisinesAreas:Cuisines and areas`, href: paths.dashboard.cuisines },
        { label: $localize`:@@nav.guestsOccasions:Guests and occasions`, href: paths.dashboard.events },
        { label: $localize`:@@nav.photos:Photos`, href: paths.dashboard.photos },
        { label: $localize`:@@nav.menu:Menu`, href: paths.dashboard.menu },
        { label: $localize`:@@nav.foodSafety:Food safety`, href: paths.dashboard.foodSafety },
        { label: $localize`:@@nav.reviews:Reviews`, href: paths.dashboard.reviews },
      ];
      const page = catererPage(user);
      if (page) links.push({ label: $localize`:@@nav.myPage:My page`, href: page });
      links.push({ label: $localize`:@@nav.account:Account`, href: paths.account });
      return links;
    }
    case 'Operator': {
      const links: MenuLink[] = [
        { label: $localize`:@@nav.reviewQueue:Review queue`, href: paths.admin.queue, count: queue, countLabel: waiting(queue) },
        { label: $localize`:@@nav.recentChanges:Recent changes`, href: paths.admin.changes },
        { label: $localize`:@@nav.caterers:Caterers`, href: paths.admin.caterers },
        { label: $localize`:@@nav.reviews:Reviews`, href: paths.admin.reviews },
        { label: $localize`:@@nav.metrics:Metrics`, href: paths.admin.metrics },
      ];
      // Admin-only items are not offered to other operators (L2-056.5).
      if (user.admin) links.push({ label: $localize`:@@nav.auditLog:Audit log`, href: paths.admin.audit });
      links.push({ label: $localize`:@@nav.cuisines:Cuisines`, href: paths.admin.cuisines });
      if (user.admin) links.push({ label: $localize`:@@nav.operators:Operators`, href: paths.admin.operators });
      links.push({ label: $localize`:@@nav.breaches:Breach register`, href: paths.admin.breaches });
      return links;
    }
    default:
      return [
        { label: $localize`:@@nav.caterers:Caterers`, href: paths.caterers },
        { label: $localize`:@@nav.occasions:Occasions`, href: paths.occasions },
        { label: $localize`:@@nav.signIn:Sign in`, href: paths.signIn },
        { label: $localize`:@@nav.register:Create an account`, href: paths.register },
        { label: $localize`:@@nav.join:Cater with Sweet Hand`, href: paths.join },
      ];
  }
}

export function signedInLine(user: SessionUser): string {
  if (user.role === 'Caterer' && user.caterer)
    return $localize`:@@menu.signedInCaterer:Signed in as ${user.displayName}:name:, ${user.caterer.name}:business:`;
  if (user.role === 'Operator' && user.admin) return $localize`:@@menu.signedInAdmin:Signed in as ${user.displayName}:name:, Admin`;
  return $localize`:@@menu.signedIn:Signed in as ${user.displayName}:name:`;
}

export function smallLinks(user: SessionUser | null): FooterLink[] {
  const links: FooterLink[] = [
    { label: $localize`:@@footer.privacy:Privacy`, href: paths.privacy },
    { label: $localize`:@@footer.terms:Terms`, href: paths.terms },
  ];
  if (user?.role !== 'Operator') links.unshift({ label: $localize`:@@footer.about:About`, href: paths.about });
  return links;
}

export function footerLinks(user: SessionUser | null): FooterLink[] {
  const links = smallLinks(user);
  if (!user || user.role === 'Customer') links.splice(1, 0, { label: $localize`:@@footer.caterWithUs:Cater with us`, href: paths.join });
  return links;
}

export function footerLine(user: SessionUser | null): string {
  return user?.role === 'Operator'
    ? $localize`:@@footer.operatorLine:Operator console. Every action is written to the audit log.`
    : $localize`:@@footer.line:Caribbean caterers in Toronto and the GTA.`;
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

export function accountSecondLine(user: SessionUser): string {
  if (user.role === 'Caterer' && user.caterer) return `${user.caterer.name} · ${user.email}`;
  if (user.role === 'Operator') {
    const role = user.admin ? $localize`:@@menu.roleAdmin:Admin` : $localize`:@@menu.roleOperator:Operator`;
    const method =
      user.secondFactor === 'authenticator app'
        ? $localize`:@@menu.signedInWithApp:signed in with an authenticator app`
        : $localize`:@@menu.signedInWithKey:signed in with a security key`;
    return `${role} · ${method}`;
  }
  return user.email;
}

import type { SideNavItem } from '@sweet-hand/components';
import { paths } from '../../../core/routing/paths';

/** The operator console's sections (docs/mocks/pages/admin-*). Admin-only items are left out for other operators (L2-056.5). */
export function operatorNavGroups(admin: boolean, queueCount: number, url: string): SideNavItem[][] {
  const path = url.split(/[?#]/)[0];
  const item = (label: string, href: string, extra: Partial<SideNavItem> = {}): SideNavItem => ({
    label,
    href,
    current: path === href || path.startsWith(href + '/'),
    ...extra,
  });
  const main = [
    item($localize`:@@nav.reviewQueue:Review queue`, paths.admin.queue, queueCount
      ? { count: String(queueCount), countLabel: $localize`:@@operatorNav.waiting:${queueCount}:count: waiting` }
      : {}),
    item($localize`:@@nav.recentChanges:Recent changes`, paths.admin.changes),
    item($localize`:@@nav.caterers:Caterers`, paths.admin.caterers),
    item($localize`:@@nav.reviews:Reviews`, paths.admin.reviews),
    item($localize`:@@nav.metrics:Metrics`, paths.admin.metrics),
  ];
  const settings = [
    ...(admin ? [item($localize`:@@nav.auditLog:Audit log`, paths.admin.audit)] : []),
    item($localize`:@@nav.cuisines:Cuisines`, paths.admin.cuisines),
    ...(admin ? [item($localize`:@@nav.operators:Operators`, paths.admin.operators)] : []),
    item($localize`:@@nav.breaches:Breach register`, paths.admin.breaches),
  ];
  return [main, settings];
}

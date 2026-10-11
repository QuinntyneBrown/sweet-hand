import type { SideNavItem } from '@sweet-hand/components';
import { paths } from '../../core/routing/paths';

/** The caterer dashboard's side navigation with Account current (docs/mocks/pages/account/caterer). */
export function catererNavGroups(unread: number): SideNavItem[][] {
  return [
    [
      { label: $localize`:@@nav.overview:Overview`, href: paths.dashboard.overview },
      { label: $localize`:@@nav.businessDetails:Business details`, href: paths.dashboard.details },
      { label: $localize`:@@nav.cuisinesAreas:Cuisines and areas`, href: paths.dashboard.cuisines },
      { label: $localize`:@@nav.guestsOccasions:Guests and occasions`, href: paths.dashboard.events },
      { label: $localize`:@@nav.photos:Photos`, href: paths.dashboard.photos },
      { label: $localize`:@@nav.menu:Menu`, href: paths.dashboard.menu },
      { label: $localize`:@@nav.foodSafety:Food safety`, href: paths.dashboard.foodSafety },
    ],
    [
      { label: $localize`:@@nav.enquiries:Enquiries`, href: paths.dashboard.enquiries, count: unread ? $localize`:@@nav.unread:${unread}:count: unread` : undefined },
      { label: $localize`:@@nav.reviews:Reviews`, href: paths.dashboard.reviews },
      { label: $localize`:@@nav.account:Account`, href: paths.account, current: true },
    ],
  ];
}

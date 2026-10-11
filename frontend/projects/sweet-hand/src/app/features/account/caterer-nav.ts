import type { SideNavItem } from '@sweet-hand/components';

/** The caterer dashboard's side navigation with Account current (docs/mocks/pages/account/caterer). */
export function catererNavGroups(unread: number): SideNavItem[][] {
  return [
    [
      { label: $localize`:@@nav.overview:Overview`, href: '/dashboard' },
      { label: $localize`:@@nav.businessDetails:Business details`, href: '/dashboard/profile/details' },
      { label: $localize`:@@nav.cuisinesAreas:Cuisines and areas`, href: '/dashboard/profile/cuisines' },
      { label: $localize`:@@nav.guestsOccasions:Guests and occasions`, href: '/dashboard/profile/events' },
      { label: $localize`:@@nav.photos:Photos`, href: '/dashboard/profile/photos' },
      { label: $localize`:@@nav.menu:Menu`, href: '/dashboard/profile/menu' },
      { label: $localize`:@@nav.foodSafety:Food safety`, href: '/dashboard/profile/food-safety' },
    ],
    [
      { label: $localize`:@@nav.enquiries:Enquiries`, href: '/dashboard/enquiries', count: unread ? $localize`:@@nav.unread:${unread}:count: unread` : undefined },
      { label: $localize`:@@nav.reviews:Reviews`, href: '/dashboard/reviews' },
      { label: $localize`:@@nav.account:Account`, href: '/account', current: true },
    ],
  ];
}

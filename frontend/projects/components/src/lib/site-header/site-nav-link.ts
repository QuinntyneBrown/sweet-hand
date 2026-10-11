export interface SiteNavLink {
  label: string;
  href: string;
  current?: boolean;
  count?: number;
  /** Hidden text after the badge, e.g. "1 unread enquiry"; required when count > 0. */
  countLabel?: string;
}

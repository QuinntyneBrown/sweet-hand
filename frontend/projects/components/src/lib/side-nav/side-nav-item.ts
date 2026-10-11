export interface SideNavItem {
  /** "Enquiries", from the resource files. */
  label: string;
  /** "/dashboard/enquiries" */
  href: string;
  /** Renders aria-current="page". At most one item in all groups. */
  current?: boolean;
  /** Visible count text, already formatted: "2 unread", "7". */
  count?: string;
  /** Spoken instead of a bare number: "7 waiting" (D-2). */
  countLabel?: string;
}

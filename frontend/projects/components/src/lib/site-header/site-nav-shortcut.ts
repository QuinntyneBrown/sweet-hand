export interface SiteNavShortcut {
  label: string;
  href: string;
  current?: boolean;
  count?: number;
  /** The short count for the icon's name: "1 unread". */
  countLabel?: string;
}

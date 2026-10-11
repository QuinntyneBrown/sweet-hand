/** One link of the list in navigation mode. */
export interface NavItem {
  label: string;
  href: string;
  current: boolean;
  count?: string;
  badge?: { text: string; label: string };
}

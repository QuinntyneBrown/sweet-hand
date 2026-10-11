export interface SectionLinkItem {
  title: string;
  href: string;
  meta?: string;
  status?: 'missing' | 'done' | 'attention' | null;
}

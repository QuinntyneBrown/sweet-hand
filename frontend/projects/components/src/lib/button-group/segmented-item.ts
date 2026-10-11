export interface SegmentedItem {
  value: string;
  label: string;
  count?: number | null;
  hiddenSuffix?: string | null;
  href?: string;
  disabled?: boolean;
}

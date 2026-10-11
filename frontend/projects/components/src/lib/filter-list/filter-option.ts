/** One toggle option of a filter group (filter-list CRD, API). */
export interface FilterOption {
  value: string;
  label: string;
  /** Matching caterers with the other active filters; `null` while counts are not known yet (loading, error). */
  count: number | null;
  pressed: boolean;
  disabled?: boolean;
}

/** Zero-count options stay listed but disabled, unless chosen so they can be unchosen (filter-list AC-8). */
export function optionDisabled(o: FilterOption, groupDisabled: boolean): boolean {
  return groupDisabled || (o.disabled ?? (o.count === 0 && !o.pressed));
}

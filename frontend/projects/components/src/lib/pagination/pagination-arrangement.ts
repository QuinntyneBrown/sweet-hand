/** One cell of the pagination row: a page link or a gap that follows a page. */
export type PageCell = { kind: 'page'; page: number; only: 'wide' | 'narrow' | null } | { kind: 'gap'; after: number; only: 'wide' | 'narrow' | null };

/**
 * Pages shown in one arrangement (pagination CRD, "Which items render").
 * `narrow` drops the neighbours of the current page.
 */
export function arrangement(page: number, count: number, narrow: boolean): (number | 'gap')[] {
  const shown = new Set([1, count, page, ...(narrow ? [] : [page - 1, page + 1])].filter((p) => p >= 1 && p <= count));
  const sorted = [...shown].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    // A single hidden page is shown, never "…": always when wide, and when narrow
    // only if that keeps the row to three page links (D-4, D-10).
    const fill = !narrow || sorted.length === 2;
    if (prev !== undefined && p - prev === 2 && fill) out.push(prev + 1);
    if (prev !== undefined && p - prev > (fill ? 2 : 1)) out.push('gap');
    out.push(p);
  });
  return out;
}

function keyed(items: (number | 'gap')[]): Map<string, number> {
  const out = new Map<string, number>();
  let last = 0;
  for (const item of items) {
    if (item === 'gap') out.set(`g${last}`, last + 0.5);
    else {
      out.set(`p${item}`, item);
      last = item;
    }
  }
  return out;
}

/** The union of the wide and narrow arrangements in page order (D-5); `compact` uses only the narrow one. */
export function cells(page: number, count: number, compact: boolean): PageCell[] {
  const narrow = keyed(arrangement(page, count, true));
  const wide = compact ? narrow : keyed(arrangement(page, count, false));
  const all = new Map([...wide, ...narrow]);
  return [...all.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([key, position]) => {
      const only = wide.has(key) && narrow.has(key) ? null : wide.has(key) ? 'wide' : 'narrow';
      return key.startsWith('p') ? { kind: 'page', page: position, only } : { kind: 'gap', after: Math.floor(position), only };
    });
}

import { foldText } from '@sweet-hand/components';
import type { ServiceArea } from '../../../core/api/discovery.models';

/**
 * What a search for "an area or a postal code" means (L2-011, L2-012).
 * Only the forward sortation area (first 3 characters) of a postal code is
 * ever used or sent (L2-012.6).
 */
export type AreaSearch =
  | { kind: 'area'; area: ServiceArea }
  | { kind: 'postal'; fsa: string }
  | { kind: 'invalid-postal' }
  | { kind: 'no-match' }
  | { kind: 'empty' };

const LETTER = '[ABCEGHJ-NPRSTVXY]';
const LATER = '[ABCEGHJ-NPRSTV-Z]';
const FULL = new RegExp(`^(${LETTER}\\d${LATER})\\s?\\d${LATER}\\d$`);
const FSA_ONLY = new RegExp(`^(${LETTER}\\d${LATER})$`);

export function interpretSearch(text: string, areas: readonly ServiceArea[]): AreaSearch {
  const trimmed = text.trim();
  if (!trimmed) return { kind: 'empty' };
  if (/\d/.test(trimmed)) {
    const upper = trimmed.toUpperCase();
    const m = FULL.exec(upper) ?? FSA_ONLY.exec(upper);
    return m ? { kind: 'postal', fsa: m[1] } : { kind: 'invalid-postal' };
  }
  const q = foldText(trimmed);
  const exact = areas.find((a) => foldText(a.name) === q);
  if (exact) return { kind: 'area', area: exact };
  const partial = areas.filter((a) => foldText(a.name).includes(q));
  return partial.length === 1 ? { kind: 'area', area: partial[0] } : { kind: 'no-match' };
}

export function matchCountText(count: number): string {
  return count === 1
    ? $localize`:@@search.oneMatch:1 area matches`
    : $localize`:@@search.manyMatch:${count}:count: areas match`;
}

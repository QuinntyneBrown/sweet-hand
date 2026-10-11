import { invalid, problem } from '../http/problems.ts';
import type { Reply } from '../http/endpoint.ts';
import { FSA_TO_AREA } from './taxonomy.ts';

const LETTER = '[ABCEGHJ-NPRSTV-Z]';
const FSA = new RegExp(`^[ABCEGHJ-NPRSTVXY]\\d${LETTER}$`);
const POSTAL = new RegExp(`^([ABCEGHJ-NPRSTVXY]\\d${LETTER}) ?(\\d${LETTER}\\d)?$`);

/** The forward sortation area of a Canadian postal code (3 or 6 characters), or null when the format is wrong (L2-012.4). */
export function fsaOf(value: string): string | null {
  return POSTAL.exec(value.trim().toUpperCase())?.[1] ?? null;
}

/** True when the value is exactly a forward sortation area. */
export const isFsa = (value: string): boolean => FSA.test(value.trim().toUpperCase());

export const invalidPostalCode = (): Reply => invalid({ postalCode: ['Enter a valid postal code, like M5V 2T6'] });

export const OUTSIDE_SERVICE_AREA = 'Sweet Hand currently serves Toronto and the GTA';

/** 422 for a well-formed FSA that no GTA service area covers (L2-012.5). */
export const outsideServiceArea = (): Reply => problem(422, OUTSIDE_SERVICE_AREA, { type: 'outside-service-area' });

/** The service area an FSA maps to, if any. */
export const areaOfFsa = (fsa: string): string | undefined => FSA_TO_AREA[fsa.toUpperCase()];

/** Keeps only the FSA of a postal code in a logged path (L2-012.6). */
export const redactPostalPath = (path: string): string => path.replace(/^(\/api\/public\/fsa\/[^/]{0,3})[^/]*/i, '$1');

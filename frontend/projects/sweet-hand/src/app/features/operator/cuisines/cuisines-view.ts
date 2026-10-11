import { shortDate, torontoToday } from '../../../core/format/format';
import { type OperatorCuisine } from '@sweet-hand/api';

/** Case- and accent-insensitive, so "HAÏTIAN" is the same cuisine as "Haitian" (docs/mocks/dialogs/add-cuisine/invalid.html). */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('en-CA')
    .replace(/\s+/g, ' ')
    .trim();

/** A new cuisine's name: 2 to 40 characters and not already on the list. The server applies the same rules. */
export function cuisineNameError(name: string, existing: readonly string[]): string | null {
  const n = name.replace(/\s+/g, ' ').trim();
  if (!n) return $localize`:@@addCuisine.nameRequired:Enter a cuisine name`;
  if (n.length < 2 || n.length > 40) return $localize`:@@addCuisine.nameLength:Use 2 to 40 characters`;
  const duplicate = existing.find((e) => fold(e) === fold(n));
  return duplicate ? $localize`:@@addCuisine.duplicate:${duplicate}:name: is already on the list` : null;
}

/** "19 cuisines · shown in filters and caterer profiles": active cuisines only. */
export function cuisinesSubtitle(cuisines: OperatorCuisine[]): string {
  const active = cuisines.filter((c) => !c.retired).length;
  return active === 1
    ? $localize`:@@cuisines.subtitleOne:1 cuisine · shown in filters and caterer profiles`
    : $localize`:@@cuisines.subtitle:${active}:count: cuisines · shown in filters and caterer profiles`;
}

function caterersLine(n: number): string {
  if (n === 0) return $localize`:@@cuisines.noCaterers:No published caterers`;
  return n === 1 ? $localize`:@@cuisines.oneCaterer:1 published caterer` : $localize`:@@cuisines.caterers:${n}:count: published caterers`;
}

/** Added today: shows the "New" badge (docs/mocks/pages/admin-cuisines/default.html). */
export function isNew(c: OperatorCuisine, now: Date = new Date()): boolean {
  return !c.retired && !!c.addedBy && torontoToday(new Date(c.addedAt)) === torontoToday(now);
}

/** The row's meta line: usage, or who added it today, or when it was retired. */
export function cuisineMeta(c: OperatorCuisine, now: Date = new Date()): string {
  if (c.retired && c.retiredAt) {
    const when = torontoToday(new Date(c.retiredAt)) === torontoToday(now) ? $localize`:@@cuisines.today:today` : shortDate(c.retiredAt, now);
    return c.publishedCaterers
      ? $localize`:@@cuisines.retiredKept:Retired ${when}:when: · ${caterersLine(c.publishedCaterers).toLowerCase()}:caterers: keep it`
      : $localize`:@@cuisines.retired:Retired ${when}:when:`;
  }
  if (isNew(c, now)) {
    return c.publishedCaterers
      ? $localize`:@@cuisines.addedTodayUsed:Added today by ${c.addedBy}:name: · ${caterersLine(c.publishedCaterers).toLowerCase()}:caterers:`
      : $localize`:@@cuisines.addedToday:Added today by ${c.addedBy}:name: · no caterers yet`;
  }
  return caterersLine(c.publishedCaterers);
}

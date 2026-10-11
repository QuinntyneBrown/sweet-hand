/** Shared words of the autosaving section pages (docs/mocks/pages/profile-details, profile-cuisines, profile-events). */

/** "Fix 2 things so we can save" */
export function fixHeading(n: number): string {
  return n === 1 ? $localize`:@@section.fixOne:Fix 1 thing so we can save` : $localize`:@@section.fixMany:Fix ${n}:count: things so we can save`;
}

/** "Not saved: fix 2 things below" */
export function notSavedText(n: number): string {
  return n === 1 ? $localize`:@@section.notSavedOne:Not saved: fix 1 thing below` : $localize`:@@section.notSavedMany:Not saved: fix ${n}:count: things below`;
}

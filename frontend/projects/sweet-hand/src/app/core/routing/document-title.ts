/** A page's document title: its name, then the site's (" · Sweet Hand"). */
export function documentTitle(page: string): string {
  return $localize`:@@app.documentTitle:${page}:page: · Sweet Hand`;
}

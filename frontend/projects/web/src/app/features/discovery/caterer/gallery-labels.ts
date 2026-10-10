import type { ViewerLabels } from '@sweet-hand/components';

/** Words for the gallery and the photo viewer (gallery CRD), from the resource files. */

export const VIEWER_LABELS: ViewerLabels = {
  close: $localize`:@@viewer.close:Close photo viewer`,
  previous: $localize`:@@viewer.previous:Previous photo`,
  next: $localize`:@@viewer.next:Next photo`,
  loading: (n, total) => $localize`:@@viewer.loading:Loading photo ${n}:n: of ${total}:total:`,
  failed: (n, total) => $localize`:@@viewer.failed:Photo ${n}:n: of ${total}:total: didn’t load`,
  failedNote: $localize`:@@viewer.failedNote:This photo didn’t load.`,
  retry: $localize`:@@common.tryAgain:Try again`,
};

/** "Open photo 2 of 6: Curry chicken with rice and buss up shut in a steel karahi" */
export function openPhotoLabel(n: number, total: number, caption: string): string {
  return $localize`:@@gallery.open:Open photo ${n}:n: of ${total}:total:: ${caption}:caption:`;
}

/** "+25 photos" on the thumbnail, "25 more photos in the viewer" in its name. */
export function morePhotosLabel(hidden: number): { visible: string; spoken: string } {
  return hidden === 1
    ? { visible: $localize`:@@gallery.moreOne:+1 photo`, spoken: $localize`:@@gallery.moreOneSpoken:1 more photo in the viewer` }
    : { visible: $localize`:@@gallery.more:+${hidden}:count: photos`, spoken: $localize`:@@gallery.moreSpoken:${hidden}:count: more photos in the viewer` };
}

/** "2 of 6" */
export function photoCountLabel(n: number, total: number): string {
  return $localize`:@@viewer.count:${n}:n: of ${total}:total:`;
}

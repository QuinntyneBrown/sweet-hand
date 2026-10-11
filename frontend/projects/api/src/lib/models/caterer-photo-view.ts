export interface CatererPhotoView {
  /** The caterer's caption: the photo's text alternative (L2-068.1). */
  caption: string;
  /** The 800 px rendition. */
  src: string;
  /** Renditions at 400, 800 and 1200 px. */
  srcset: string;
  width: number;
  height: number;
  /** The rendition the full-screen viewer loads. */
  viewerSrc: string;
}

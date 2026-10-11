export interface PhotoView {
  /** The caterer's caption for the photo (L2-006.4, L2-068.1). */
  alt: string;
  /** The 800 px rendition, the fallback `src`. */
  src: string;
  /** AVIF renditions at 400, 800 and 1200 px (L2-006.1, L2-006.2). */
  srcset: string;
  /** Intrinsic size of `src`; reserves the square before the image arrives (L2-006.5). */
  width: number;
  height: number;
}

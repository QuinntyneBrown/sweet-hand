/** One gallery photo, in the caterer's order (gallery CRD, API). */
export interface GalleryPhoto {
  src: string;
  srcset: string;
  width: number;
  height: number;
  caption: string;
  /** The large rendition the viewer shows. */
  viewerSrc: string;
}

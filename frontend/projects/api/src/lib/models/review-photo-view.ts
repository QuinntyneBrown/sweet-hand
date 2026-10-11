export interface ReviewPhotoView {
  id: string;
  src: string;
  caption: string;
  cover: boolean;
  /** Added since the last "Changes requested" decision (L2-047.3). */
  isNew: boolean;
}

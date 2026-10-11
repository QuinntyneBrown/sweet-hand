import type { PhotoRendition } from './photo-rendition';

export interface OwnPhotoView {
  id: string;
  /** Empty until the caterer writes one (L2-042.3). */
  caption: string;
  /** The name the file was uploaded with, for photos still processing. */
  fileName: string | null;
  /** `Processing` while the image service works on it (L2-041, L2-091.2). */
  state: 'Ready' | 'Processing';
  /** Null while processing. */
  image: PhotoRendition | null;
}

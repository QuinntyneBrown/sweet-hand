import type { PhotoView } from '@contract/photo-view.ts';
import type { CatererPhotoView } from '@contract/caterer-photo-view.ts';
import type { Photo } from '../caterers/model.ts';

const WIDTHS = [400, 800, 1200];

/** Rendition URLs for a photo (L2-006): AVIF at three widths, JPEG at 800 px as the fallback. */
export function photoView(photo: Pick<Photo, 'file' | 'caption'>): PhotoView {
  const base = `/media/${photo.file}`;
  return {
    alt: photo.caption,
    src: `${base}?w=800&fm=jpeg`,
    srcset: WIDTHS.map((w) => `${base}?w=${w}&fm=avif ${w}w`).join(', '),
    width: 280,
    height: 280,
  };
}

export function catererPhotoView(photo: Photo): CatererPhotoView {
  const view = photoView(photo);
  return { caption: photo.caption, src: view.src, srcset: view.srcset, width: view.width, height: view.height, viewerSrc: `/media/${photo.file}?w=1200&fm=jpeg` };
}

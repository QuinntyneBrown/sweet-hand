import type { PhotoView } from '../../projects/api/src/lib/models/photo-view.ts';
import type { Photo } from '../seed/photo.ts';

/** Derivative URLs the CDN would serve; the fake serves the same JPEG for every size and format. */
export function photoView(photo: Photo): PhotoView {
  const base = `/media/${photo.file}`;
  const srcset = [400, 800, 1200].map((w) => `${base}?w=${w}&fm=avif ${w}w`).join(', ');
  return { alt: photo.caption, src: `${base}?w=800&fm=jpeg`, srcset, width: 280, height: 280 };
}

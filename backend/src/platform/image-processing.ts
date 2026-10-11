import type { MediaObject } from './media.ts';

/**
 * The image service (L2-041.4–6): scans an accepted upload for malware,
 * strips its metadata and re-encodes it before anyone else can see it.
 * Returns undefined while the service is unavailable; the upload is then kept
 * privately and the photo stays "Processing" until a later attempt succeeds
 * (L2-091.2).
 */
export interface ImageProcessing {
  process(upload: MediaObject): Promise<MediaObject | undefined>;
}

/**
 * No image provider is chosen yet: this passes the upload through unchanged.
 * It does NOT scan for malware, strip EXIF/XMP/IPTC metadata or produce the
 * AVIF/WebP/JPEG renditions L2-041 asks for. `available` lets tests and the
 * test-mode scenarios simulate an outage.
 */
export class PassThroughImageProcessing implements ImageProcessing {
  available = true;

  async process(upload: MediaObject): Promise<MediaObject | undefined> {
    return this.available ? upload : undefined;
  }
}

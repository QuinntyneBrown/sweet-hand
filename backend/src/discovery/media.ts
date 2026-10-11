import type { Request, Reply } from '../http/endpoint.ts';
import { notFound } from '../http/problems.ts';
import { isPublicMedia } from '../platform/media.ts';

/**
 * Serves photos by media id (L2-006). Every rendition query (`w`, `fm`) gets
 * the stored image until derivative processing exists. Cached for at most
 * 60 s, so a removed photo stops being served within a minute (L2-058.4).
 * Private media (certificate copies, unprocessed uploads) is never served.
 */
export async function media(req: Request): Promise<Reply> {
  if (!isPublicMedia(req.params['id'])) return notFound();
  const object = await req.env.media.get(req.params['id']);
  if (!object || object.contentType === 'application/pdf') return notFound();
  return { status: 200, raw: object.bytes, headers: { 'content-type': object.contentType, 'cache-control': 'public, max-age=60' } };
}

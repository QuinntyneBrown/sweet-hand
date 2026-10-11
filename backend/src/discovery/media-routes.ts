import { anonymous, type Area, type Request, type Reply } from '../http/router.ts';
import { notFound } from '../http/problems.ts';
import { isPublicMedia } from '../platform/media.ts';

/**
 * Serves photos by media id (L2-006). Every rendition query (`w`, `fm`) gets
 * the stored image until derivative processing exists; CDN caching applies.
 * Private media (certificate copies, unprocessed uploads) is never served.
 */
async function media(req: Request): Promise<Reply> {
  if (!isPublicMedia(req.params['id'])) return notFound();
  const object = await req.env.media.get(req.params['id']);
  if (!object || object.contentType === 'application/pdf') return notFound();
  return { status: 200, raw: object.bytes, headers: { 'content-type': object.contentType, 'cache-control': 'public, max-age=3600' } };
}

/** Public photos, anonymous by explicit choice: the caterer pages show them to everyone. */
export const mediaArea: Area = (r) => {
  r.get('/media/:id', anonymous, media);
};

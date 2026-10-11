import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type pg from 'pg';

export interface MediaObject {
  contentType: string;
  bytes: Buffer;
}

/** Uploaded and processed media (photos, certificate copies), by id. */
export interface MediaStore {
  get(id: string): Promise<MediaObject | undefined>;
  put(id: string, object: MediaObject): Promise<void>;
  delete(id: string): Promise<void>;
}

/** Media ids are file-name-like: letters, digits, dots, dashes and underscores, never a path. */
export const validMediaId = (id: string): boolean => /^[\w][\w.-]{0,199}$/.test(id) && !id.includes('..');

/** Media under this prefix is never served publicly: certificate copies and unprocessed uploads (L2-040.4, L2-041.5). */
export const PRIVATE_MEDIA = 'private-';
export const isPublicMedia = (id: string): boolean => !id.startsWith(PRIVATE_MEDIA);

/** The mock photos the fictional cast uses (docs/mocks/assets/img). */
export const CAST_MEDIA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'docs', 'mocks', 'assets', 'img');

const TYPES: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif', pdf: 'application/pdf' };
export const contentTypeOf = (name: string): string => TYPES[name.split('.').pop()?.toLowerCase() ?? ''] ?? 'application/octet-stream';

/** Reads the cast's photos from disk; used to seed and as the read-only base of the in-memory store. */
export async function castMedia(id: string): Promise<MediaObject | undefined> {
  if (!validMediaId(id)) return undefined;
  const bytes = await readFile(join(CAST_MEDIA_DIR, id)).catch(() => undefined);
  return bytes && { contentType: contentTypeOf(id), bytes };
}

/** The fake media store for tests and local development: uploads in memory over the cast's photos. */
export class MemoryMediaStore implements MediaStore {
  private readonly objects = new Map<string, MediaObject | null>();

  async get(id: string): Promise<MediaObject | undefined> {
    if (!validMediaId(id)) return undefined;
    const own = this.objects.get(id);
    if (own === null) return undefined;
    return own ?? castMedia(id);
  }

  async put(id: string, object: MediaObject): Promise<void> {
    this.objects.set(id, { contentType: object.contentType, bytes: Buffer.from(object.bytes) });
  }

  async delete(id: string): Promise<void> {
    this.objects.set(id, null);
  }
}

/** Media in PostgreSQL's `media` table (ADR 0007). */
export class PostgresMediaStore implements MediaStore {
  private readonly pool: pg.Pool;

  constructor(pool: pg.Pool) {
    this.pool = pool;
  }

  async get(id: string): Promise<MediaObject | undefined> {
    if (!validMediaId(id)) return undefined;
    const { rows } = await this.pool.query('SELECT content_type, bytes FROM media WHERE id = $1', [id]);
    return rows[0] && { contentType: rows[0].content_type as string, bytes: rows[0].bytes as Buffer };
  }

  async put(id: string, object: MediaObject): Promise<void> {
    await this.pool.query(
      'INSERT INTO media (id, content_type, bytes) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET content_type = EXCLUDED.content_type, bytes = EXCLUDED.bytes',
      [id, object.contentType, object.bytes],
    );
  }

  async delete(id: string): Promise<void> {
    await this.pool.query('DELETE FROM media WHERE id = $1', [id]);
  }
}

import type { Request, Reply } from '../http/endpoint.ts';
import { ok } from '../http/problems.ts';
import type { Document, Transaction } from '../platform/database.ts';
import type { SiteNotice } from '@contract/notices.models.ts';

/** Something everyone should know about Sweet Hand itself: planned maintenance or a struggling dependency (L2-088, L2-091). */
export type NoticeDocument = SiteNotice & Document;

export const notices = (tx: Transaction) => tx.collection<NoticeDocument>('notices');

export async function listNotices(req: Request): Promise<Reply> {
  return ok((await notices(req.tx).all()) as SiteNotice[]);
}

import type { Request, Reply } from '../http/endpoint.ts';
import { invalid, noContent, ok } from '../http/problems.ts';
import type { ConsentRequest } from '@contract/consent-request.ts';
import type { PrivacyNotice } from '@contract/privacy-notice.ts';
import { users } from './model.ts';
import { currentPrivacyNotice, recordConsent } from './privacy.ts';
import { currentUser } from './sessions.ts';

/** The current notice (consent-to-privacy-notice design). */
export async function privacyNotice(req: Request): Promise<Reply> {
  const { version, effectiveDate, changes } = await currentPrivacyNotice(req.tx);
  return ok({ version, effectiveDate, changes } satisfies PrivacyNotice);
}

/** Accepts the current notice for the signed-in account (L2-070.3). */
export async function acceptPrivacyNotice(req: Request): Promise<Reply> {
  const body = (req.body ?? {}) as Partial<ConsentRequest>;
  const notice = await currentPrivacyNotice(req.tx);
  if (body.version !== notice.version) return invalid({ version: ['Accept the current privacy notice'] });
  const user = currentUser(req);
  await users(req.tx).put({ ...user, acceptedPrivacyVersion: notice.version, acceptedPrivacyAt: req.now.toISOString() });
  await recordConsent(req.tx, user.id, notice.version, req.now);
  return noContent();
}

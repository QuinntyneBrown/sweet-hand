import type { Reply, Request } from '../http/router.ts';
import { conflict } from '../http/problems.ts';
import { recordStatusChange } from '../moderation/model.ts';
import type { SubmissionProblem } from '@contract/submission-problem.ts';
import { loadOwn, saveCaterer } from './own.ts';
import { ownProfileReply } from './profile.ts';
import { checklist } from './view.ts';

/** `POST /api/caterer/profile/submission`: a draft that meets every rule goes to review; otherwise 422 lists what failed (L2-039, L2-046). */
export async function submitProfile(req: Request): Promise<Reply> {
  const own = await loadOwn(req);
  const c = own.caterer;
  if (c.status !== 'Draft' && c.status !== 'Changes requested') return conflict('Only a draft can be submitted', { status: c.status });
  const failed = checklist(c, own.user, req.now).filter((i) => !i.done);
  if (failed.length) {
    const problem: SubmissionProblem = {
      title: 'Your profile isn’t ready yet',
      failed: failed.map((i) => ({ key: i.key, detail: i.key === 'photos' ? `you have ${c.photos.length}` : i.key === 'menu' ? `you have ${c.dishes.length}` : null })),
    };
    return { status: 422, body: problem };
  }
  const resubmitted = c.status === 'Changes requested';
  c.status = 'Pending review';
  c.statusChangedAt = req.now.toISOString();
  delete c.attention;
  delete c.statusReason;
  await recordStatusChange(req.tx, req.now, { catererId: c.id, status: c.status, by: own.user.id, step: resubmitted ? 'resubmitted' : 'submitted' });
  await saveCaterer(req, c);
  return ownProfileReply(req, own);
}

/**
 * `DELETE /api/caterer/profile/submission`: back to Draft (L2-039.4). The
 * moderation history has no "withdrawn" step (StatusChangeView), so the
 * withdrawal is not added to it.
 */
export async function withdrawSubmission(req: Request): Promise<Reply> {
  const own = await loadOwn(req);
  const c = own.caterer;
  if (c.status !== 'Pending review') return conflict('Only a profile waiting for review can be withdrawn', { status: c.status });
  c.status = 'Draft';
  c.statusChangedAt = req.now.toISOString();
  await saveCaterer(req, c);
  return ownProfileReply(req, own);
}

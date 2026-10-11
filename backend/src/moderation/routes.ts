import { roles, type Area } from '../http/router.ts';
import { contributeSessionCounters } from '../identity/session-view.ts';
import { queueItems, reviewQueue } from './queue.ts';
import { approveName, approveProfile, declineName, requestChanges } from './decisions.ts';
import { certificateFile, certificateFileLink, profileForReview } from './profile-review.ts';

const operators = roles('Operator');

// The shell shows how many items wait in the review queue.
contributeSessionCounters({ queueCount: async (tx, now) => (await queueItems(tx, now)).length });

/** Operator moderation endpoints (docs/detailed-designs/moderation). Every route checks the operator role (L2-056.3). */
export const moderationArea: Area = (r) => {
  r.get('/api/operator/queue', operators, reviewQueue);
  r.get('/api/operator/queue/profiles/:id', operators, profileForReview);
  r.get('/api/operator/profiles/:id/certificate-file', operators, certificateFileLink);
  // The link's token and an operator session are both needed.
  r.get('/api/operator/certificate-files/:token', operators, certificateFile);
  r.post('/api/operator/profiles/:id/approve', operators, approveProfile);
  r.post('/api/operator/profiles/:id/request-changes', operators, requestChanges);
  r.post('/api/operator/profiles/:id/name/approve', operators, approveName);
  r.post('/api/operator/profiles/:id/name/request-changes', operators, declineName);
};

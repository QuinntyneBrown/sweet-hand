import { roles, type Area } from '../http/router.ts';
import { contributeSessionCounters } from '../identity/session-view.ts';
import { queueItems, reviewQueue } from './queue.ts';

const operators = roles('Operator');

// The shell shows how many items wait in the review queue.
contributeSessionCounters({ queueCount: async (tx, now) => (await queueItems(tx, now)).length });

/** Operator moderation endpoints (docs/detailed-designs/moderation). Every route checks the operator role (L2-056.3). */
export const moderationArea: Area = (r) => {
  r.get('/api/operator/queue', operators, reviewQueue);
};

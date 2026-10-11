import { anonymous, type Area } from '../http/router.ts';
import { submitReport } from './submit.ts';

/** Reports endpoints (docs/detailed-designs/moderation/report-content). */
export const reportsArea: Area = (r) => {
  // Anonymous by explicit choice (L2-054): anyone may report; visitors pass the bot challenge and the hourly limit.
  r.post('/api/reports', anonymous, submitReport);
};

import type { Environment } from '../environment.ts';
import { torontoDate } from '../discovery/listing.ts';
import { processWaitingPhotos } from '../caterer-profile/processing.ts';
import { dispatchDueEmails, type EmailGateway } from '../platform/email-dispatch.ts';
import { writeLog } from '../platform/log-redactor.ts';
import { runDailyMaintenance } from './daily.ts';

/**
 * The background work (ADR 0008 keeps it in the API process; designs name a
 * background worker): every tick sends due emails and finishes waiting
 * photos; once per Toronto day it runs the daily maintenance job.
 */
export function startBackgroundWork(env: Environment, gateway: EmailGateway, everyMs = 15_000): () => void {
  let running = false;
  let lastDailyRun = '';
  const tick = async () => {
    await dispatchDueEmails(env, gateway);
    await processWaitingPhotos(env);
    const today = torontoDate(env.clock.now());
    if (today !== lastDailyRun) {
      lastDailyRun = today;
      await runDailyMaintenance(env);
    }
  };
  const timer = setInterval(() => {
    if (running) return;
    running = true;
    void tick()
      .catch((err) => writeLog({ level: 'error', event: 'background-work-failed', message: (err as Error).message }))
      .finally(() => (running = false));
  }, everyMs);
  return () => clearInterval(timer);
}

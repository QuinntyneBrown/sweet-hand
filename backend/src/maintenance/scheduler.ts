import type { Environment } from '../environment.ts';
import { torontoDate } from '../discovery/listing.ts';
import { processWaitingPhotos } from '../caterer-profile/processing.ts';
import { dispatchDueEmails, type EmailGateway } from '../platform/email-dispatch.ts';
import { writeLog } from '../platform/log-redactor.ts';
import { runDailyMaintenance } from './daily.ts';
import { generateDataExports } from '../account/data-export.ts';
import { aggregateMetrics } from '../operator-settings/metrics-aggregation.ts';
import { sweepLaunchList } from '../launch-list/sweep.ts';

/** The dashboard follows within the hour (L2-061.3); aggregating every 15 minutes leaves room. */
const AGGREGATE_EVERY_MS = 15 * 60_000;
/** The launch list retention sweep runs hourly (L2-099.5, L2-101.6). */
const SWEEP_LAUNCH_LIST_EVERY_MS = 60 * 60_000;

/**
 * The background work (ADR 0008 keeps it in the API process; designs name a
 * background worker): every tick sends due emails, finishes waiting photos
 * and builds requested data exports; every 15 minutes it refreshes the
 * metrics aggregates; every hour it sweeps the launch list; once per Toronto day it runs the daily maintenance job.
 */
export function startBackgroundWork(env: Environment, gateway: EmailGateway, everyMs = 15_000): () => void {
  let running = false;
  let lastDailyRun = '';
  let lastAggregation = 0;
  let lastLaunchListSweep = 0;
  const tick = async () => {
    await dispatchDueEmails(env, gateway);
    await processWaitingPhotos(env);
    await generateDataExports(env);
    if (env.clock.now().getTime() - lastAggregation >= AGGREGATE_EVERY_MS) {
      lastAggregation = env.clock.now().getTime();
      await aggregateMetrics(env);
    }
    if (env.clock.now().getTime() - lastLaunchListSweep >= SWEEP_LAUNCH_LIST_EVERY_MS) {
      lastLaunchListSweep = env.clock.now().getTime();
      await sweepLaunchList(env);
    }
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

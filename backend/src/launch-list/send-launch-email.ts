/**
 * `npm run launch-email`: the explicit launch-day command (send-launch-day-email
 * design). It closes sign-ups, then queues one launch-day email per
 * `Confirmed` entry through the outbox. There is no web UI (L2-101.1).
 */
import { pathToFileURL } from 'node:url';
import type { Environment } from '../environment.ts';
import { torontoDate } from '../discovery/listing.ts';
import { launchListConfig } from './config.ts';
import { queueLaunchDay } from './emails.ts';
import { LAUNCH_STATE_ID, launchList, launchState, launchStates } from './model.ts';

const BATCH = 500;

/**
 * Each entry is marked in the same transaction that queues its email, so a
 * second run, or one resumed after a crash, queues nothing twice (L2-101.2).
 */
export async function sendLaunchEmail(env: Environment): Promise<{ queued: number; alreadyQueued: number }> {
  const config = launchListConfig();
  await env.db.transaction(async (tx) => {
    const state = await launchState(tx);
    if (state.launchEmailRunAt) return;
    const now = env.clock.now();
    // From here on, sign-ups get 410 and confirmation links confirm nothing (L2-102).
    await launchStates(tx).put({ ...state, id: LAUNCH_STATE_ID, launchEmailRunAt: now.toISOString(), launchDay: torontoDate(now) });
  });
  const alreadyQueued = await env.db.transaction(async (tx) => (await launchList(tx).find({ status: 'Confirmed' })).filter((e) => e.launchEmailQueuedAt).length);
  let queued = 0;
  for (;;) {
    const done = await env.db.transaction(async (tx) => {
      const now = env.clock.now();
      const batch = (await launchList(tx).find({ status: 'Confirmed' })).filter((e) => !e.launchEmailQueuedAt).slice(0, BATCH);
      for (const entry of batch) {
        const marked = { ...entry, launchEmailQueuedAt: now.toISOString() };
        await launchList(tx).put(marked);
        await queueLaunchDay(tx, now, marked, config);
      }
      queued += batch.length;
      return batch.length < BATCH;
    });
    if (done) break;
  }
  return { queued, alreadyQueued };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const { PostgresDatabase } = await import('../platform/postgres-database.ts');
  const { requiredEnv } = await import('../platform/config.ts');
  const { systemClock } = await import('../platform/clock.ts');
  const db = new PostgresDatabase(requiredEnv('DATABASE_URL'));
  try {
    // Only the database and clock are used; the rest of the environment is not needed here.
    console.log(JSON.stringify(await sendLaunchEmail({ db, clock: systemClock } as unknown as Environment)));
  } finally {
    await db.close();
  }
}

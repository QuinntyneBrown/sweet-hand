import { randomUUID } from 'node:crypto';
import type { Environment } from '../environment.ts';
import type { Document, Transaction } from '../platform/database.ts';
import { enquiries, type Enquiry } from '../enquiries/model.ts';
import { securityEvents } from '../platform/security-log.ts';
import { audit } from '../platform/audit.ts';
import { visits } from '../operator-settings/model.ts';
import { users, type User } from '../identity/model.ts';
import { queueEmail } from '../platform/outbox.ts';
import { processDeletion } from '../account/deletion.ts';
import { systemRequest } from '../maintenance/system-request.ts';
import { writeLog } from '../platform/log-redactor.ts';

/** What one rule did in a run (CategoryOutcome, L2-073.3). */
export interface CategoryOutcome {
  deleted: number;
  warned?: number;
  error?: string;
}

/** One daily run of the retention job, kept so operators can show the rules are applied (RetentionRun, L2-073.3). */
export interface RetentionRun extends Document {
  startedAt: string;
  finishedAt: string;
  categories: Record<string, CategoryOutcome>;
}

export const retentionRuns = (tx: Transaction) => tx.collection<RetentionRun>('retentionRuns');

/** The retention periods of L2-073 (RetentionPolicy): configuration, not literals spread through the rules. */
export const RETENTION_POLICY = {
  enquiriesAfterClose: { years: 3 },
  inactivityWarning: { years: 2, months: 11 },
  inactivityGraceDays: 30,
  securityLogs: { months: 13 },
  auditLog: { years: 7 },
  visitAnalytics: { months: 25 },
} as const;

const BATCH = 100;

function before(now: Date, period: { years?: number; months?: number }): Date {
  const d = new Date(now);
  d.setUTCMonth(d.getUTCMonth() - (period.years ?? 0) * 12 - (period.months ?? 0));
  return d;
}

/** When an enquiry was closed or declined, if it has been. */
function closedAt(e: Enquiry): string | undefined {
  if (e.status !== 'Closed' && e.status !== 'Declined') return undefined;
  return e.events.filter((ev) => ev.kind === 'closed' || ev.kind === 'declined').at(-1)?.at;
}

/** Deletes, in batches, the documents of one collection whose instant is before the cut-off. */
async function purge<T extends Document>(
  env: Environment,
  collection: (tx: Transaction) => { all(): Promise<T[]>; delete(id: string): Promise<void> },
  instant: (doc: T) => string | undefined,
  cutoff: Date,
): Promise<CategoryOutcome> {
  const due = await env.db.transaction(async (tx) =>
    (await collection(tx).all()).filter((d) => {
      const at = instant(d);
      return !!at && Date.parse(at) < cutoff.getTime();
    }).map((d) => d.id),
  );
  for (let i = 0; i < due.length; i += BATCH) {
    await env.db.transaction(async (tx) => {
      for (const id of due.slice(i, i + BATCH)) await collection(tx).delete(id);
    });
  }
  return { deleted: due.length };
}

const isMember = (u: User) => !u.deleted && (u.role === 'Customer' || u.role === 'Caterer');

/**
 * InactiveAccountRule: warns an account 2 years and 11 months after its last
 * sign-in, and deletes it through the account deletion processing 30 days
 * after the warning if no sign-in has cleared it (L2-073.2).
 */
async function inactiveAccounts(env: Environment): Promise<CategoryOutcome> {
  const now = env.clock.now();
  const warnBefore = before(now, RETENTION_POLICY.inactivityWarning);
  const deleteBefore = new Date(now.getTime() - RETENTION_POLICY.inactivityGraceDays * 24 * 60 * 60_000);
  const members = await env.db.transaction(async (tx) => (await users(tx).all()).filter(isMember));
  let warned = 0;
  let deleted = 0;
  for (const { id } of members) {
    await env.db.transaction(async (tx) => {
      const user = await users(tx).get(id);
      if (!user || !isMember(user)) return;
      if (user.inactivityWarnedAt) {
        if (Date.parse(user.inactivityWarnedAt) > deleteBefore.getTime()) return;
        await processDeletion(systemRequest(env, tx, 'retention'), user);
        deleted++;
        return;
      }
      if (Date.parse(user.lastSignInAt ?? user.createdAt) > warnBefore.getTime()) return;
      await users(tx).put({ ...user, inactivityWarnedAt: now.toISOString() });
      await queueEmail(tx, now, { to: user.email, kind: 'inactivity-warning', link: '/sign-in', deleteAfterDays: RETENTION_POLICY.inactivityGraceDays });
      warned++;
    });
  }
  return { deleted, warned };
}

/**
 * The retention rules, one per data category (L2-073). Certificate files need
 * no rule here: a replaced or deleted certificate's file is removed at once.
 */
const RULES: [string, (env: Environment) => Promise<CategoryOutcome>][] = [
  ['enquiries', (env) => purge(env, enquiries, closedAt, before(env.clock.now(), RETENTION_POLICY.enquiriesAfterClose))],
  ['inactive-accounts', inactiveAccounts],
  ['security-logs', (env) => purge(env, securityEvents, (e) => e.at, before(env.clock.now(), RETENTION_POLICY.securityLogs))],
  ['audit-log', (env) => purge(env, audit, (e) => e.at, before(env.clock.now(), RETENTION_POLICY.auditLog))],
  ['visit-analytics', (env) => purge(env, visits, (v) => v.occurredAt, before(env.clock.now(), RETENTION_POLICY.visitAnalytics))],
];

/**
 * The daily retention job (RetentionJob): runs every rule, records a failure
 * against its category without stopping the others, and writes one run.
 */
export async function enforceRetention(env: Environment): Promise<RetentionRun> {
  const startedAt = env.clock.now().toISOString();
  const categories: Record<string, CategoryOutcome> = {};
  for (const [category, rule] of RULES) {
    try {
      categories[category] = await rule(env);
    } catch (err) {
      categories[category] = { deleted: 0, error: (err as Error).message };
      writeLog({ level: 'error', event: 'retention-rule-failed', category, message: (err as Error).message });
    }
  }
  const run: RetentionRun = { id: `ret-${randomUUID()}`, startedAt, finishedAt: env.clock.now().toISOString(), categories };
  await env.db.transaction((tx) => retentionRuns(tx).put(run));
  return run;
}

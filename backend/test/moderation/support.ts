/**
 * Arrangements for the moderation acceptance tests. Reports are seeded by the
 * reports area; these tests put the reports they need themselves, so they do
 * not depend on that seed.
 */
import type { Api } from '../support/api.ts';
import { allScenarios } from '../../src/testing/scenarios/index.ts';
import type { Report } from '../../src/reports/model.ts';
import { CAST_NOW } from '../../src/platform/clock.ts';

/** Puts documents straight into the test's fake database. */
export function put(api: Api, collection: string, ...docs: { id: string }[]): Promise<void> {
  return api.env.db.transaction(async (tx) => {
    for (const doc of docs) await tx.collection<{ id: string }>(collection).put(doc);
  });
}

/** Runs a named test-mode scenario, as the Playwright suite does. */
export function scenario(api: Api, name: string, args: unknown = {}): Promise<unknown> {
  return api.env.db.transaction(async (tx) => allScenarios[name]({ tx, now: api.env.clock.now(), env: api.env }, args));
}

/** The four open reports of docs/mocks/README.md (R-2041, R-2044, R-2047, R-2052). */
export const CAST_REPORTS: Report[] = [
  {
    id: 'R-2052',
    targetKind: 'CatererProfile',
    targetId: 'cat-001',
    reason: 'Inaccurate information',
    details: 'The areas list Ajax but they told us they don’t go east of Pickering.',
    reporterUserId: 'user-marcia',
    createdAt: '2026-10-08T23:15:00.000Z',
    status: 'Open',
  },
  {
    id: 'R-2041',
    targetKind: 'Review',
    targetId: 'review-devon-maracas',
    reason: 'Fake or spam',
    details: 'This person never booked them. The same words were posted about two other caterers.',
    reporterUserId: 'user-priya',
    createdAt: '2026-10-08T20:12:00.000Z',
    status: 'Open',
  },
  {
    id: 'R-2044',
    targetKind: 'Review',
    targetId: 'review-devon-maracas',
    reason: 'Inappropriate content',
    details: 'It insults the owner’s family, not the food.',
    createdAt: '2026-10-09T15:30:00.000Z',
    status: 'Open',
  },
  {
    id: 'R-2047',
    targetKind: 'CatererProfile',
    targetId: 'cat-018',
    reason: 'Food safety concern',
    details: 'Several guests at our church harvest supper on Sat 26 Sep were sick the next day. We all ate the curry goat.',
    createdAt: '2026-10-10T08:12:00.000Z',
    status: 'Open',
  },
];

export const putCastReports = (api: Api) => put(api, 'reports', ...CAST_REPORTS);

/**
 * Audit entries the test's own actions wrote: the seeded history is older than
 * the test clock's start, so it is left out.
 */
export async function auditOf(api: Api): Promise<any[]> {
  const docs = await api.env.db.transaction((tx) => tx.collection<any>('audit').all());
  return docs.filter((a) => a.at >= CAST_NOW).sort((a, b) => a.at.localeCompare(b.at) || a.seq - b.seq);
}

/** Makes `docs` the caterer's only enquiries, whatever the enquiries area seeds. */
export function onlyEnquiries(api: Api, catererId: string, ...docs: { id: string }[]): Promise<void> {
  return api.env.db.transaction(async (tx) => {
    const all = tx.collection<{ id: string; catererId: string }>('enquiries');
    for (const e of await all.find({ catererId })) await all.delete(e.id);
    for (const doc of docs) await tx.collection<{ id: string }>('enquiries').put(doc);
  });
}

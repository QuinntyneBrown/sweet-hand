import type { Router } from '../lib/router.ts';
import { conflict, invalid } from '../lib/http.ts';
import { currentUser, newId as storeId, type Store } from '../lib/store.ts';
import type { Report } from '../seed/report.ts';
import type { ReportDuplicate } from '../../projects/api/src/lib/models/report-duplicate.ts';
import type { ReportRequest } from '../../projects/api/src/lib/models/report-request.ts';

const REASONS: Report['reason'][] = ['Inaccurate information', 'Inappropriate content', 'Fake or spam', 'Food safety concern', 'Other'];
/** Reports one connection may send in a rolling hour (L2-054.3). */
const HOURLY_LIMIT = 5;
/** Every request in one test's store comes from the same connection. */
const THIS_CONNECTION = 'this-connection';

/** Fake endpoints of the reports area (docs/detailed-designs/moderation/report-content). */
export function registerReports(r: Router<Store>): void {
  /** Anonymous by explicit choice (L2-054): anyone may report a published caterer or review. */
  r.post('/api/reports', (ctx) => {
    const store = ctx.store;
    const body = (ctx.body ?? {}) as Partial<ReportRequest>;
    const user = currentUser(store, ctx.cookies);

    const hourAgo = store.now.getTime() - 60 * 60 * 1000;
    const recent = store.reports.filter((x) => x.connection === THIS_CONNECTION && new Date(x.createdAt).getTime() > hourAgo);
    if (recent.length >= HOURLY_LIMIT) return { status: 429, body: { title: 'Too many reports from this connection' }, headers: { 'retry-after': '3600' } };

    if (!user && !body.challengeToken) return invalid({ challengeToken: ['Complete the check'] });
    const errors: Record<string, string[]> = {};
    if (!body.reason || !REASONS.includes(body.reason)) errors['reason'] = ['Choose a reason'];
    const details = (body.details ?? '').trim();
    if (body.reason === 'Other' && !details) errors['details'] = ['Tell us what’s wrong'];
    if (details.length > 1000) errors['details'] = ['Keep the details to 1,000 characters or fewer'];
    if (Object.keys(errors).length) return invalid(errors);

    let targetId: string | undefined;
    if (body.targetKind === 'CatererProfile') targetId = store.caterers.find((c) => c.slug === body.targetId && c.status === 'Published')?.id;
    else if (body.targetKind === 'Review') targetId = store.reviews.find((x) => x.id === body.targetId && x.status === 'Published')?.id;
    if (!targetId) return invalid({ targetId: ['This can no longer be reported'] });

    if (user) {
      const open = store.reports.find((x) => x.reporterUserId === user.id && x.targetId === targetId && x.status === 'Open');
      if (open) {
        const duplicate: ReportDuplicate = { title: 'You’ve already reported this', reportedAt: open.createdAt };
        return conflict(duplicate.title, { reportedAt: duplicate.reportedAt });
      }
    }

    const report: Report = {
      id: `R-${2100 + store.reports.length}`,
      targetKind: body.targetKind!,
      targetId,
      reason: body.reason!,
      details: details || undefined,
      reporterUserId: user?.id,
      connection: THIS_CONNECTION,
      createdAt: store.now.toISOString(),
      status: 'Open',
    };
    store.reports.push(report);
    return { status: 201, body: { id: report.id } };
  });
}

/** Named store changes tests can ask for (`backend.scenario(name, args)`). */
export const reportsScenarios: Record<string, (store: Store, args: any) => unknown> = {
  /** Reports already sent from this connection in the last hour: { count }. */
  'reports-from-this-connection': (store, { count }: { count: number }) => {
    for (let i = 0; i < count; i++) {
      store.reports.push({
        id: storeId(),
        targetKind: 'CatererProfile',
        targetId: 'cat-002',
        reason: 'Fake or spam',
        connection: THIS_CONNECTION,
        createdAt: new Date(store.now.getTime() - (10 + i) * 60 * 1000).toISOString(),
        status: 'Open',
      });
    }
  },
};

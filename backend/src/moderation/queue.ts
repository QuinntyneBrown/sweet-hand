/** The operator review queue (work-review-queue design, L2-047, L2-055.1). */
import type { Request, Reply } from '../http/router.ts';
import { ok } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { caterers, type Caterer } from '../caterers/model.ts';
import { reports, type Report } from '../reports/model.ts';
import { reviews } from '../reviews/model.ts';
import { areaName } from '../discovery/taxonomy.ts';
import { torontoDate } from '../discovery/listing.ts';
import { certificateExpiries, historyOf } from './model.ts';
import { coverOf, cuisineNames, isLate, pageNumber, paginate, reviewerLabel } from './views.ts';
import type { QueueCounts } from '@contract/queue-counts.ts';
import type { QueueFilter } from '@contract/queue-filter.ts';
import type { QueueItemView } from '@contract/queue-item-view.ts';
import type { QueuePageView } from '@contract/queue-page-view.ts';
import type { ReportReason } from '@contract/report-reason.ts';

/** When the profile entered review, and whether it came back after changes were requested. */
export async function submissionOf(tx: Transaction, c: Caterer): Promise<{ at: string; resubmitted: boolean }> {
  const last = (await historyOf(tx, c.id)).reverse().find((h) => h.step === 'submitted' || h.step === 'resubmitted');
  return { at: last?.at ?? c.statusChangedAt ?? c.createdAt, resubmitted: last?.step === 'resubmitted' };
}

/** "Review of Maracas Bay by Devon W.", or null when the review or its caterer is gone. */
export async function reviewTitle(tx: Transaction, reviewId: string): Promise<string | null> {
  const review = await reviews(tx).get(reviewId);
  const caterer = review && (await caterers(tx).get(review.catererId));
  return review && caterer ? `Review of ${caterer.name} by ${reviewerLabel(review.authorName)}` : null;
}

/** Open reports grouped by the item they are about (L2-055.1), oldest report first. */
export async function openReportGroups(tx: Transaction): Promise<Report[][]> {
  const groups = new Map<string, Report[]>();
  const open = (await reports(tx).find({ status: 'Open' })).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  for (const r of open) {
    const key = `${r.targetKind}:${r.targetId}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.values()];
}

export async function queueItems(tx: Transaction, now: Date): Promise<QueueItemView[]> {
  const today = torontoDate(now);
  const cuisine = await cuisineNames(tx);
  const items: QueueItemView[] = [];
  const base = (id: string, targetId: string, title: string, photo: string | null, waitingSince: string) => ({
    id,
    targetId,
    title,
    photo,
    waitingSince,
    late: isLate(now, waitingSince),
  });

  for (const c of await caterers(tx).all()) {
    if (c.status === 'Pending review') {
      const s = await submissionOf(tx, c);
      items.push({ ...base(`profile:${c.id}`, c.id, c.name, coverOf(c), s.at), kind: s.resubmitted ? 'resubmitted' : 'profile', cuisine: cuisine(c.cuisines[0]), area: areaName(c.areas[0]) });
    }
    if (c.pendingName && c.status !== 'Removed') {
      items.push({ ...base(`name:${c.id}`, c.id, c.name, coverOf(c), c.pendingNameAt ?? now.toISOString()), kind: 'name-change', newName: c.pendingName, status: c.status });
    }
    if (c.status === 'Published' && c.certificate && c.certificate.expires < today) {
      const detectedAt = (await certificateExpiries(tx).get(c.id))?.detectedAt ?? `${c.certificate.expires}T09:00:00.000Z`;
      items.push({ ...base(`certificate:${c.id}`, c.id, c.name, coverOf(c), detectedAt), kind: 'certificate', expired: c.certificate.expires, status: c.status });
    }
  }

  for (const group of await openReportGroups(tx)) {
    const first = group[0];
    let title: string | null;
    let hidden = false;
    if (first.targetKind === 'Review') {
      title = await reviewTitle(tx, first.targetId);
      const review = await reviews(tx).get(first.targetId);
      hidden = review?.status === 'Hidden' && hiddenByReports(review);
    } else {
      title = (await caterers(tx).get(first.targetId))?.name ?? null;
    }
    if (!title) continue;
    const reasons = [...new Set(group.map((r) => r.reason))] as ReportReason[];
    items.push({ ...base(`reports:${first.id}`, first.id, title, null, first.createdAt), kind: 'reports', count: group.length, reasons, hidden });
  }

  for (const r of await reviews(tx).find({ status: 'Held' })) {
    const title = await reviewTitle(tx, r.id);
    if (!title) continue;
    items.push({ ...base(`review:${r.id}`, r.id, title, null, r.createdAt), kind: 'held-review', holdReason: r.holdReason ?? 'link' });
  }

  return items.sort((a, b) => Date.parse(a.waitingSince) - Date.parse(b.waitingSince) || a.id.localeCompare(b.id));
}

/** A review hidden automatically after reports, not by an operator (L2-055.2). */
export const hiddenByReports = (r: { hiddenBy?: string; hidden?: { by: string | null } }): boolean =>
  r.hiddenBy ? r.hiddenBy === 'reports' : !!r.hidden && r.hidden.by === null;

const FILTERS: Record<QueueFilter, QueueItemView['kind'][]> = {
  profiles: ['profile', 'resubmitted'],
  'name-changes': ['name-change'],
  certificates: ['certificate'],
  reports: ['reports'],
};

function queueCounts(items: QueueItemView[]): QueueCounts {
  const n = (kinds: QueueItemView['kind'][]) => items.filter((i) => kinds.includes(i.kind)).length;
  return {
    all: items.length,
    profiles: n(FILTERS.profiles),
    nameChanges: n(FILTERS['name-changes']),
    certificates: n(FILTERS.certificates),
    reports: n(FILTERS.reports),
    heldReviews: n(['held-review']),
  };
}

/** GET /api/operator/queue */
export async function reviewQueue(req: Request): Promise<Reply> {
  const all = await queueItems(req.tx, req.now);
  const kinds = FILTERS[req.query.get('kind') as QueueFilter] as QueueItemView['kind'][] | undefined;
  const matching = kinds ? all.filter((i) => kinds.includes(i.kind)) : all;
  const view: QueuePageView = { ...paginate(matching, pageNumber(req.query)), counts: queueCounts(all), late: all.filter((i) => i.late).length };
  return ok(view);
}

import type { Request, Reply } from '../http/router.ts';
import { ok } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { audit, type AuditEntry } from '../platform/audit.ts';
import { torontoDate } from '../discovery/listing.ts';
import { cuisines } from '../discovery/taxonomy.ts';
import { caterers } from '../caterers/model.ts';
import { reviews } from '../reviews/model.ts';
import { enquiries } from '../enquiries/model.ts';
import { reports } from '../reports/model.ts';
import { users } from '../identity/model.ts';
import type { AuditEntryView } from '@contract/audit-entry-view.ts';
import type { AuditPage } from '@contract/audit-page.ts';
import { breaches, operatorInvitations } from './model.ts';
import { byName, fold } from './text.ts';

/** query-audit-log: Admins filter by operator, action, target and dates; newest first; nothing edits or deletes (L2-060). */

const PAGE_SIZE = 20;

/** Filter values that stand for several actions. */
const ACTION_GROUPS: Record<string, string[]> = {
  'resolve-report': ['DismissReports', 'ResolveReports'],
  'operator-account': ['CreateOperator', 'DeactivateOperator'],
  cuisines: ['AddCuisine', 'RetireCuisine'],
};

/**
 * Labels for seeded history about records the cast does not hold (an
 * enquiry and a report from before the seed), used only when the record
 * itself is not found.
 */
const HISTORIC_TARGETS: Record<string, string> = {
  'cat-breadfruit-and-butter': 'Breadfruit & Butter',
  'enq-island-pot-r2047': 'Enquiry with Island Pot',
  'R-2033': 'Report on Sugar Dumplin',
};

/** "Devon W." */
function shortName(full: string): string {
  const [first, ...rest] = full.split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0]}.` : first;
}

/** Moderation actions may store structured before/after values; the log shows them as text. */
function asText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
}

/** What an Admin reads as the target of an entry. Lookups are cached per request. */
function targetLabeller(tx: Transaction): (e: AuditEntry) => Promise<string> {
  const cache = new Map<string, Promise<string | undefined>>();
  const once = (key: string, find: () => Promise<string | undefined>) => {
    if (!cache.has(key)) cache.set(key, find());
    return cache.get(key)!;
  };
  const catererName = (id: string) => once(`caterer:${id}`, async () => (await caterers(tx).get(id))?.name);
  const label = async (e: AuditEntry): Promise<string | undefined> => {
    switch (e.targetType) {
      case 'caterer':
        return catererName(e.targetId);
      case 'review':
        return once(`review:${e.targetId}`, async () => {
          const review = await reviews(tx).get(e.targetId);
          return review && `Review of ${(await catererName(review.catererId)) ?? review.catererId} by ${shortName(review.authorName)}`;
        });
      case 'enquiry':
        return once(`enquiry:${e.targetId}`, async () => {
          const enquiry = await enquiries(tx).get(e.targetId);
          return enquiry && `Enquiry with ${(await catererName(enquiry.catererId)) ?? enquiry.catererId}`;
        });
      case 'report':
        return once(`report:${e.targetId}`, async () => {
          const report = await reports(tx).get(e.targetId);
          if (!report) return undefined;
          const review = report.targetKind === 'Review' ? await reviews(tx).get(report.targetId) : undefined;
          const catererId = review?.catererId ?? report.targetId;
          return `Report on ${(await catererName(catererId)) ?? catererId}`;
        });
      case 'operator':
      case 'user':
        return once(`user:${e.targetId}`, async () => (await users(tx).get(e.targetId))?.displayName ?? (await operatorInvitations(tx).get(e.targetId))?.name);
      case 'cuisine':
        return once(`cuisine:${e.targetId}`, async () => (await cuisines(tx).get(e.targetId))?.name);
      case 'breach':
        return once(`breach:${e.targetId}`, async () => (await breaches(tx).get(e.targetId))?.title);
      default:
        return undefined;
    }
  };
  return async (e) => (await label(e)) ?? HISTORIC_TARGETS[e.targetId] ?? e.targetId;
}

export async function queryAuditLog(req: Request): Promise<Reply> {
  const q = req.query;
  const operatorId = q.get('operator') ?? '';
  const actions = (q.get('action') ?? '').split(',').filter(Boolean).flatMap((a) => ACTION_GROUPS[a] ?? [a]);
  const target = fold(q.get('target') ?? '');
  const from = q.get('from') ?? '';
  const to = q.get('to') ?? '';
  const page = Math.max(1, Math.floor(Number(q.get('page') ?? 1)) || 1);

  const operators = (await users(req.tx).find({ role: 'Operator' })).map((u) => ({ id: u.id, name: u.displayName })).sort(byName);
  const names = new Map(operators.map((o) => [o.id, o.name]));
  const labelOf = targetLabeller(req.tx);
  const all = await audit(req.tx).all();

  const candidates = all
    .filter((e) => !operatorId || e.operatorId === operatorId)
    .filter((e) => !actions.length || actions.includes(e.action))
    .filter((e) => {
      const day = torontoDate(new Date(e.at));
      return (!from || day >= from) && (!to || day <= to);
    });
  const views: AuditEntryView[] = await Promise.all(
    candidates.map(async (e) => ({
      id: e.id,
      at: new Date(e.at).toISOString(),
      operatorId: e.operatorId,
      operatorName: names.get(e.operatorId) ?? e.operatorId,
      action: e.action,
      targetType: e.targetType,
      targetId: e.targetId,
      targetLabel: await labelOf(e),
      reason: e.reason ?? '',
      before: asText(e.before),
      after: asText(e.after),
    })),
  );
  const seq = new Map(candidates.map((e) => [e.id, e.seq]));
  const matching = views
    .filter((e) => !target || fold(e.targetLabel).includes(target) || fold(e.targetId).includes(target))
    .sort((a, b) => b.at.localeCompare(a.at) || (seq.get(b.id) ?? 0) - (seq.get(a.id) ?? 0));

  const body: AuditPage = {
    entries: matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: matching.length,
    page,
    pageSize: PAGE_SIZE,
    anyEntries: all.length > 0,
    operators,
  };
  return ok(body);
}

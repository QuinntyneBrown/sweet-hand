/** The operator caterer list and record (suspend-reinstate-remove-profile, edit-profile-as-operator designs). */
import type { Request, Reply } from '../http/router.ts';
import { ok } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { caterers, type Caterer, type ProfileStatus } from '../caterers/model.ts';
import { users, type User } from '../identity/model.ts';
import { enquiries } from '../enquiries/model.ts';
import { reports } from '../reports/model.ts';
import { ratingSummary } from '../reviews/rating.ts';
import { areaName, occasionName } from '../discovery/taxonomy.ts';
import { torontoDate } from '../discovery/listing.ts';
import { certificateExpiries, recordChanges, statusHistory, type StatusChange } from './model.ts';
import { targetCaterer } from './lifecycle.ts';
import { certificateView, coverOf, cuisineNames, nameOf, ownerView, pageNumber, paginate, statusHistoryOf } from './views.ts';
import type { CatererCounts } from '@contract/caterer-counts.ts';
import type { CatererFlag } from '@contract/caterer-flag.ts';
import type { CatererRecordView } from '@contract/caterer-record-view.ts';
import type { CatererRowView } from '@contract/caterer-row-view.ts';
import type { CaterersPageView } from '@contract/caterers-page-view.ts';
import type { CatererStatusFilter } from '@contract/caterer-status-filter.ts';

const STATUS_FILTERS: Record<CatererStatusFilter, ProfileStatus> = {
  draft: 'Draft',
  pending: 'Pending review',
  changes: 'Changes requested',
  published: 'Published',
  suspended: 'Suspended',
  removed: 'Removed',
};

const latest = (...dates: (string | undefined)[]) =>
  dates.filter((x): x is string => !!x).reduce((a, b) => (Date.parse(b) > Date.parse(a) ? b : a));

/** Every caterer as a row; the collections are read once, not per caterer. */
async function catererRows(tx: Transaction, now: Date): Promise<CatererRowView[]> {
  const today = torontoDate(now);
  const cuisine = await cuisineNames(tx);
  const accounts = (await users(tx).all()).filter((u) => !u.deleted);
  const byId = new Map(accounts.map((u) => [u.id, u]));
  const byCaterer = new Map<string, User>();
  for (const u of accounts) if (u.role === 'Caterer' && u.catererId) byCaterer.set(u.catererId, u);
  const histories = new Map<string, StatusChange[]>();
  for (const h of (await statusHistory(tx).all()).sort((a, b) => a.at.localeCompare(b.at) || a.seq - b.seq)) histories.set(h.catererId, [...(histories.get(h.catererId) ?? []), h]);
  const changed = new Map((await recordChanges(tx).all()).map((r) => [r.id, r.at]));
  const openReports = new Map<string, number>();
  for (const r of await reports(tx).find({ status: 'Open', targetKind: 'CatererProfile' })) openReports.set(r.targetId, (openReports.get(r.targetId) ?? 0) + 1);

  return (await caterers(tx).all()).map((c): CatererRowView => {
    const history = histories.get(c.id) ?? [];
    const lastSubmission = [...history].reverse().find((h) => h.step === 'submitted' || h.step === 'resubmitted');
    const reportCount = openReports.get(c.id) ?? 0;
    const flag: CatererFlag | null = c.pendingName
      ? 'name-change'
      : reportCount
        ? 'open-reports'
        : c.status === 'Pending review' && lastSubmission?.step === 'resubmitted'
          ? 'resubmitted'
          : c.status === 'Published' && c.certificate && c.certificate.expires < today
            ? 'certificate-expired'
            : null;
    const owner = (c.ownerUserId && byId.get(c.ownerUserId)) || byCaterer.get(c.id);
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      photo: coverOf(c),
      cuisine: cuisine(c.cuisines[0]),
      area: areaName(c.areas[0]),
      owner: owner?.displayName ?? c.certificate?.holder ?? c.name,
      updatedAt: latest(changed.get(c.id), history.at(-1)?.at, c.publishedAt ?? c.createdAt),
      flag,
      openReports: reportCount,
    };
  });
}

/** GET /api/operator/caterers?status=&q=&page= */
export async function listCaterersForOperators(req: Request): Promise<Reply> {
  const status = STATUS_FILTERS[req.query.get('status') as CatererStatusFilter] as ProfileStatus | undefined;
  const q = (req.query.get('q') ?? '').trim().toLocaleLowerCase('en-CA');
  const all = (await catererRows(req.tx, req.now)).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || a.id.localeCompare(b.id));
  const found = q ? all.filter((c) => c.name.toLocaleLowerCase('en-CA').includes(q) || c.owner.toLocaleLowerCase('en-CA').includes(q)) : all;
  const matching = status ? found.filter((c) => c.status === status) : found;
  const n = (s: ProfileStatus) => all.filter((c) => c.status === s).length;
  const counts: CatererCounts = {
    all: all.length,
    draft: n('Draft'),
    pending: n('Pending review'),
    changes: n('Changes requested'),
    published: n('Published'),
    suspended: n('Suspended'),
    removed: n('Removed'),
  };
  const other = !matching.length && status && q ? found[0] : undefined;
  const view: CaterersPageView = { ...paginate(matching, pageNumber(req.query)), counts, otherMatch: other ? { name: other.name, status: other.status } : null };
  return ok(view);
}

export async function catererRecord(tx: Transaction, now: Date, c: Caterer): Promise<CatererRecordView> {
  const cuisine = await cuisineNames(tx);
  const sent = await enquiries(tx).find({ catererId: c.id });
  const history = await statusHistoryOf(tx, c);
  const lastSuspension = [...history].reverse().find((h) => h.step === 'suspended');
  const removal = [...history].reverse().find((h) => h.step === 'removed');
  const openReports = (await reports(tx).find({ status: 'Open', targetKind: 'CatererProfile', targetId: c.id })).length;
  const entries = [];
  for (const h of [...history].reverse()) entries.push({ at: h.at, status: h.status, by: await nameOf(tx, h.by), step: h.step, reason: h.reason ?? null });
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    status: c.status,
    photo: coverOf(c),
    pendingName: c.pendingName ?? null,
    owner: await ownerView(tx, c),
    profile: {
      photos: c.photos.map((p) => ({ id: p.id, src: `/media/${p.file}?w=400&fm=jpeg`, alt: p.caption })),
      cuisines: c.cuisines.map(cuisine),
      areas: c.areas.map(areaName),
      minGuests: c.minGuests,
      maxGuests: c.maxGuests,
      occasions: c.occasions.map(occasionName),
      dishes: c.dishes.map((d) => ({ id: d.id, name: d.name })),
      description: c.description,
    },
    certificate: certificateView(now, c),
    certificateReminders: (await certificateExpiries(tx).get(c.id))?.reminders ?? [],
    activity: {
      enquiries: sent.length,
      openEnquiries: sent.filter((e) => e.status === 'Open' || e.status === 'Replied').length,
      rating: await ratingSummary(tx, c.id),
      openReports,
    },
    history: entries,
    suspension: c.status === 'Suspended' && lastSuspension ? { at: lastSuspension.at, closedEnquiries: lastSuspension.closedEnquiries ?? 0 } : null,
    removal: c.status === 'Removed' && removal ? { at: removal.at } : null,
  };
}

/** GET /api/operator/caterers/:id */
export async function catererRecordView(req: Request): Promise<Reply> {
  return ok(await catererRecord(req.tx, req.now, await targetCaterer(req)));
}

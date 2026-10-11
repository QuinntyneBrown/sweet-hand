import type { SegmentedItem, StatusTone } from '@sweet-hand/components';
import { count } from '../../../../core/format/format';
import { profileStatusLabel, profileStatusTone, updatedOn } from '../moderation-text';
import { type CatererFlag, type CatererRowView, type CatererStatusFilter, type CaterersPageView, type ProfileStatus } from '@sweet-hand/api';
import { paths } from '../../../../core/routing/paths';

const FILTERS: CatererStatusFilter[] = ['draft', 'pending', 'changes', 'published', 'suspended', 'removed'];
const STATUS_OF: Record<CatererStatusFilter, ProfileStatus> = {
  draft: 'Draft',
  pending: 'Pending review',
  changes: 'Changes requested',
  published: 'Published',
  suspended: 'Suspended',
  removed: 'Removed',
};

export function readStatusFilter(value: string | null): CatererStatusFilter | null {
  return FILTERS.find((f) => f === value) ?? null;
}

export const statusOfFilter = (f: CatererStatusFilter): ProfileStatus => STATUS_OF[f];

/** "/admin/caterers?status=suspended&q=Pelau&page=2" */
export function caterersHref(query: { status?: CatererStatusFilter | null; q?: string | null; page?: number }): string {
  const parts = [query.status && `status=${query.status}`, query.q && `q=${encodeURIComponent(query.q)}`, query.page && query.page > 1 && `page=${query.page}`].filter(Boolean);
  return parts.length ? `${paths.admin.caterers}?${parts.join('&')}` : paths.admin.caterers;
}

export function statusFilters(view: CaterersPageView | undefined, q: string): SegmentedItem[] {
  const c = view?.counts;
  const counts: Record<CatererStatusFilter, number | undefined> = {
    draft: c?.draft,
    pending: c?.pending,
    changes: c?.changes,
    published: c?.published,
    suspended: c?.suspended,
    removed: c?.removed,
  };
  return [
    { value: 'all', label: $localize`:@@queue.filterAll:All`, count: c?.all ?? null, href: caterersHref({ q }) },
    ...FILTERS.map((f) => ({ value: f, label: profileStatusLabel(STATUS_OF[f]), count: counts[f] ?? null, href: caterersHref({ status: f, q }) })),
  ];
}

export interface CatererRow {
  id: string;
  href: string;
  name: string;
  photo: { src: string; width: number; height: number } | null;
  statusTone: StatusTone;
  statusLabel: string;
  meta: string;
  flag: string | null;
}

function flagText(flag: CatererFlag | null, openReports: number): string | null {
  switch (flag) {
    case 'name-change':
      return $localize`:@@caterers.flagName:Name change waiting`;
    case 'open-reports':
      return openReports === 1 ? $localize`:@@caterers.flagReport:1 open report` : $localize`:@@caterers.flagReports:${openReports}:count: open reports`;
    case 'resubmitted':
      return $localize`:@@queue.kindResubmitted:Resubmitted`;
    case 'certificate-expired':
      return $localize`:@@queue.kindCertificate:Certificate expired`;
    default:
      return null;
  }
}

export function catererRow(c: CatererRowView, now: Date = new Date()): CatererRow {
  return {
    id: c.id,
    href: c.status === 'Pending review' ? paths.admin.review(c.id) : paths.admin.caterer(c.id),
    name: c.name,
    photo: c.photo ? { src: c.photo, width: 56, height: 56 } : null,
    statusTone: profileStatusTone(c.status),
    statusLabel: profileStatusLabel(c.status),
    meta: `${c.cuisine} · ${c.area} · ${c.owner} · ${updatedOn(c.updatedAt, now)}`,
    flag: flagText(c.flag, c.openReports),
  };
}

/** "69 caterers · 60 published · sorted by last change", "0 of 69 caterers match" */
export function caterersSubtitle(view: CaterersPageView, filtered: boolean): string {
  if (view.counts.all === 0) return $localize`:@@caterers.none:No caterers yet`;
  if (filtered) return $localize`:@@caterers.matching:${count(view.total)}:count: of ${count(view.counts.all)}:all: caterers match`;
  return $localize`:@@caterers.subtitle:${count(view.counts.all)}:all: caterers · ${count(view.counts.published)}:published: published · sorted by last change`;
}

/** The no-results heading and hint (admin-caterers/no-results). */
export function noResults(view: CaterersPageView, status: CatererStatusFilter | null, q: string): { heading: string; text: string } {
  const label = status ? profileStatusLabel(STATUS_OF[status]).toLocaleLowerCase('en-CA') : '';
  if (status && q) {
    const other = view.otherMatch;
    return {
      heading: $localize`:@@caterers.noStatusMatch:No ${label}:status: caterers match “${q}:query:”`,
      text: other
        ? $localize`:@@caterers.otherMatch:${other.name}:name: is ${profileStatusLabel(other.status).toLocaleLowerCase('en-CA')}:status:. Try all statuses.`
        : $localize`:@@caterers.tryOtherName:Check the spelling, or search by the owner’s name.`,
    };
  }
  if (q) return { heading: $localize`:@@caterers.noMatch:No caterers match “${q}:query:”`, text: $localize`:@@caterers.tryOtherName:Check the spelling, or search by the owner’s name.` };
  return { heading: $localize`:@@caterers.noStatus:No ${label}:status: caterers`, text: $localize`:@@caterers.tryAll:Try all statuses.` };
}

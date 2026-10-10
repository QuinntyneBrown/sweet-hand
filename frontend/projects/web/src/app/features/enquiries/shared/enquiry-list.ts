import { ChangeDetectionStrategy, Component, computed, input, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EMPTY_STATE, Icon, InboxList, InboxRow, Pagination, Segmented, type InboxRowPicture, type SegmentedItem } from '@sweet-hand/components';
import type { InboxFilter, InboxPageView, InboxRowView, Party } from '../../../core/api/enquiries.models';
import { FILTERS, activityTime, noResults, pageSummary, rowName, rowSummary, statusLabel, statusTone } from '../enquiry-text';

/**
 * The status filter and rows of an inbox, for customers (/inbox) and caterers
 * (/dashboard/enquiries) (browse-inbox design; inbox-row and button-group CRDs).
 */
@Component({
  selector: 'app-enquiry-list',
  imports: [RouterLink, EMPTY_STATE, Icon, InboxList, InboxRow, Pagination, Segmented],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <sh-segmented ariaLabel="Filter by status" i18n-ariaLabel="@@inbox.filterLabel" [items]="filterItems()" [selected]="filter() ?? 'all'" [loading]="!view() && viewer() === 'caterer'" />
    @if (empty(); as e) {
      <sh-empty-state size="compact" [heading]="e.heading" [text]="e.text">
        @if (viewer() === 'caterer') {
          <svg slot="icon" shIcon="mail"></svg>
        }
        <a slot="actions" class="btn" [routerLink]="basePath()" i18n="@@inbox.showAll">Show all enquiries</a>
      </sh-empty-state>
    } @else {
    <sh-inbox-list [label]="label()" [busy]="!view()" loadingLabel="Loading your enquiries" i18n-loadingLabel="@@inbox.loading" [skeletonCount]="viewer() === 'caterer' ? 6 : 4">
      @for (row of rows(); track row.id) {
        <sh-inbox-row
          [href]="row.href"
          [name]="row.name"
          [picture]="row.picture"
          [time]="row.time"
          [datetime]="row.datetime"
          [summary]="row.summary"
          [statusTone]="row.tone"
          [statusLabel]="row.statusLabel"
          [unread]="row.unread"
          unreadLabel="Unread."
          i18n-unreadLabel="@@inbox.unread"
          [current]="row.id === currentId() ? currentKind() : null"
        />
      }
    </sh-inbox-list>
    }
    @if (view(); as v) {
      <sh-pagination
        [page]="v.page"
        [pageCount]="v.pageCount"
        [hrefFor]="hrefFor"
        label="Pagination"
        i18n-label="@@pagination.label"
        [summary]="summary()"
        previousLabel="Previous page"
        i18n-previousLabel="@@pagination.previous"
        nextLabel="Next page"
        i18n-nextLabel="@@pagination.next"
        [pageLabel]="pageName"
        [compact]="true"
      />
    }
  `,
})
export class EnquiryList {
  readonly view = input<InboxPageView | undefined>(undefined);
  readonly viewer = input.required<Party>();
  readonly basePath = input.required<string>();
  readonly label = input.required<string>();
  readonly filter = input<InboxFilter | null>(null);
  readonly currentId = input<string | null>(null);
  readonly currentKind = input<'page' | 'true'>('page');

  private readonly rowComponents = viewChildren(InboxRow);

  protected readonly empty = computed(() => {
    const v = this.view();
    const f = this.filter();
    return v && f && v.total === 0 ? noResults(f, this.viewer()) : null;
  });
  protected readonly summary = computed(() => {
    const v = this.view();
    return v ? pageSummary(v.page, v.pageSize, v.total) : null;
  });
  protected readonly hrefFor = (page: number): string => {
    const f = this.filter();
    const params = [f && `status=${f}`, page > 1 && `page=${page}`].filter(Boolean).join('&');
    return params ? `${this.basePath()}?${params}` : this.basePath();
  };
  protected readonly pageName = (page: number): string => $localize`:@@pagination.page:Page ${page}:page:`;

  protected readonly filterItems = computed<SegmentedItem[]>(() => {
    const counts = this.view()?.counts;
    const base = this.basePath();
    return [
      { value: 'all', label: $localize`:@@inbox.filterAll:All`, count: counts?.all ?? null, href: base },
      ...FILTERS.map((f) => ({ value: f, label: statusLabel(f), count: counts?.[f] ?? null, href: `${base}?status=${f}` })),
    ];
  });

  protected readonly rows = computed(() => {
    const viewer = this.viewer();
    const now = new Date();
    return (this.view()?.items ?? []).map((row) => ({
      id: row.id,
      href: `${this.basePath()}/${row.id}`,
      name: rowName(row),
      picture: picture(row),
      time: activityTime(row.lastActivityAt, now),
      datetime: row.lastActivityAt,
      summary: rowSummary(row, viewer, now),
      tone: statusTone(row.status),
      statusLabel: statusLabel(row.status),
      unread: row.unread,
    }));
  });

  /** Puts focus back on a row, e.g. after the back link from its thread on a phone (inbox-row AC-10). */
  focusRow(id: string): boolean {
    const index = this.rows().findIndex((r) => r.id === id);
    const row = this.rowComponents()[index];
    row?.focus();
    return !!row;
  }
}

function picture(row: InboxRowView): InboxRowPicture {
  const p = row.otherParty;
  if (p.kind === 'caterer') return { kind: 'photo', src: p.photo };
  if (p.kind === 'customer') return { kind: 'initials', text: p.initials };
  return { kind: 'gone' };
}

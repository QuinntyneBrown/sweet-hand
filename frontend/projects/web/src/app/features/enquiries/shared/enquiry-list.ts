import { ChangeDetectionStrategy, Component, computed, input, viewChildren } from '@angular/core';
import { InboxList, InboxRow, Segmented, type InboxRowPicture, type SegmentedItem } from '@sweet-hand/components';
import type { InboxFilter, InboxPageView, InboxRowView, Party } from '../../../core/api/enquiries.models';
import { FILTERS, activityTime, rowName, rowSummary, statusLabel, statusTone } from '../enquiry-text';

/**
 * The status filter and rows of an inbox, for customers (/inbox) and caterers
 * (/dashboard/enquiries) (browse-inbox design; inbox-row and button-group CRDs).
 */
@Component({
  selector: 'app-enquiry-list',
  imports: [InboxList, InboxRow, Segmented],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <sh-segmented ariaLabel="Filter by status" i18n-ariaLabel="@@inbox.filterLabel" [items]="filterItems()" [selected]="filter() ?? 'all'" [loading]="!view() && viewer() === 'caterer'" />
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

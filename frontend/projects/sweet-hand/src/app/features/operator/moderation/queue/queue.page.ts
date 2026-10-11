import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, untracked } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Alert, EMPTY_STATE, Icon, Pagination, Queue, QueueItem, Segmented, ToastNotifier } from '@sweet-hand/components';
import { Session } from '../../../../core/session/session';
import { pageName, pageSummary, readPage, readQueueFilter } from '../moderation-text';
import { arrivalText, queueFilters, queueHref, queueRow, queueSubtitle } from './queue-view';
import { OPERATOR_MODERATION_SERVICE } from '@sweet-hand/api';

/** How often an open queue checks for new items (admin-toast/info). */
export const QUEUE_REFRESH_MS = 60_000;

/** The review queue, /admin/queue (work-review-queue design; docs/mocks/pages/admin-queue). */
@Component({
  selector: 'app-review-queue-page',
  imports: [RouterLink, Alert, EMPTY_STATE, Icon, Pagination, Queue, QueueItem, Segmented],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-intro">
      <h1 i18n="@@nav.reviewQueue">Review queue</h1>
      @if (failed()) {
        <p class="subtitle" i18n="@@queue.didNotLoad">Queue didn’t load</p>
      } @else if (view(); as v) {
        <p class="subtitle">{{ subtitle() }}</p>
      } @else {
        <p class="subtitle"><span class="skeleton skeleton--text" style="width: 10rem" aria-hidden="true"></span><span class="visually-hidden" i18n="@@common.loading">Loading</span></p>
      }
    </div>

    @if (failed()) {
      <sh-alert tone="danger" live="assertive" title="We couldn’t load the review queue" i18n-title="@@queue.errorTitle">
        <ng-container i18n="@@queue.errorText">Nothing has been changed. Try again in a moment.</ng-container>
        <div slot="actions" class="alert__actions">
          <button class="btn btn--sm" type="button" (click)="queue.reload()" i18n="@@common.retry">Retry</button>
          <a routerLink="/admin/changes" i18n="@@queue.goToChanges">Go to recent changes</a>
        </div>
      </sh-alert>
    } @else if (empty()) {
      <sh-empty-state heading="All caught up" i18n-heading="@@queue.emptyTitle" text="New profiles, name changes, expired certificates, reports and held reviews appear here, oldest first." i18n-text="@@queue.emptyText">
        <svg slot="icon" shIcon="check"></svg>
        <a slot="actions" class="btn" routerLink="/admin/changes" i18n="@@queue.seeChanges">See recent changes</a>
      </sh-empty-state>
    } @else {
      <sh-segmented ariaLabel="Filter by kind" i18n-ariaLabel="@@queue.filterLabel" [items]="filters()" [selected]="filter() ?? 'all'" [loading]="!view()" />
      <sh-queue [busy]="!view()" busyLabel="Loading the review queue" i18n-busyLabel="@@queue.loading">
        @for (row of rows(); track row.id) {
          <sh-queue-item
            [href]="row.href"
            [title]="row.title"
            [renamedTo]="row.renamedTo"
            renamedLabel="renamed to"
            i18n-renamedLabel="@@queue.renamedTo"
            [media]="row.media"
            [photo]="row.photo"
            [wait]="row.wait"
            [late]="row.late"
            [kind]="row.kind"
            [meta]="row.meta"
          />
        }
      </sh-queue>
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
        />
      }
    }
  `,
})
export class ReviewQueuePage {
  private readonly api = inject(OPERATOR_MODERATION_SERVICE);
  private readonly toasts = inject(ToastNotifier);
  private readonly session = inject(Session);
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });

  protected readonly filter = computed(() => readQueueFilter(this.params().get('kind')));
  protected readonly page = computed(() => readPage(this.params().get('page')));
  protected readonly queue = rxResource({
    params: () => ({ kind: this.filter(), page: this.page() }),
    stream: ({ params }) => this.api.queue(params),
  });
  protected readonly view = computed<QueuePageView | undefined>(() => (this.queue.hasValue() ? this.queue.value() : undefined));
  protected readonly failed = computed(() => !!this.queue.error() && !this.view());
  protected readonly empty = computed(() => this.view()?.counts.all === 0);
  protected readonly subtitle = computed(() => {
    const v = this.view();
    return v ? queueSubtitle(v, this.filter()) : '';
  });
  protected readonly filters = computed(() => queueFilters(this.view()));
  protected readonly rows = computed(() => (this.view()?.items ?? []).map((i) => queueRow(i)));
  protected readonly summary = computed(() => {
    const v = this.view();
    return v ? pageSummary(v.page, v.pageSize, v.total) : null;
  });
  protected readonly pageName = pageName;
  protected readonly hrefFor = (page: number): string => {
    const kind = this.filter();
    const query = [kind && `kind=${kind}`, page > 1 && `page=${page}`].filter(Boolean).join('&');
    return query ? `/admin/queue?${query}` : '/admin/queue';
  };

  /** Ids seen on this filter and page; a poll that brings new ones announces the newest (admin-toast/info). */
  private known: { key: string; ids: Set<string> } | null = null;

  constructor() {
    effect(() => {
      const v = this.view();
      if (!v) return;
      untracked(() => this.announceArrivals(v));
    });
    const timer = setInterval(() => {
      this.queue.reload();
      void this.session.refresh();
    }, QUEUE_REFRESH_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  private announceArrivals(v: QueuePageView): void {
    const key = `${this.filter()}:${v.page}`;
    const known = this.known?.key === key ? this.known.ids : null;
    this.known = { key, ids: new Set(v.items.map((i) => i.id)) };
    if (!known) return;
    const arrived = v.items.filter((i) => !known.has(i.id));
    const newest = arrived.at(-1);
    if (!newest) return;
    const { text, action } = arrivalText(newest);
    this.toasts.show({ tone: 'info', title: $localize`:@@queue.arrivedTitle:New in the queue`, text, action: { label: action, href: queueHref(newest) } });
  }
}

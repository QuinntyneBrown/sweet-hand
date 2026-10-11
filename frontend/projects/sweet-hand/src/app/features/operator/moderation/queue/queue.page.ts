import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, untracked } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Alert, EMPTY_STATE, Icon, Pagination, Queue, QueueItem, Segmented, ToastNotifier } from '@sweet-hand/components';
import { Session } from '../../../../core/session/session';
import { pageName, pageSummary, readPage, readQueueFilter } from '../moderation-text';
import { arrivalText, queueFilters, queueHref, queueRow, queueSubtitle } from './queue-view';
import { OperatorModerationService, type QueuePageView } from '@sweet-hand/api';

/** How often an open queue checks for new items (admin-toast/info). */
export const QUEUE_REFRESH_MS = 60_000;

/** The review queue, /admin/queue (work-review-queue design; docs/mocks/pages/admin-queue). */
@Component({
  selector: 'app-review-queue-page',
  imports: [RouterLink, Alert, EMPTY_STATE, Icon, Pagination, Queue, QueueItem, Segmented],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './queue.page.html',
})
export class ReviewQueuePage {
  private readonly api = inject(OperatorModerationService);
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

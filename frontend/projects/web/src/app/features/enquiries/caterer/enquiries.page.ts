import { ChangeDetectionStrategy, Component, afterRenderEffect, computed, inject, linkedSignal, viewChild } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Alert, EMPTY_STATE, Thread } from '@sweet-hand/components';
import { EnquiriesApi } from '../../../core/api/enquiries-api';
import type { ThreadView } from '../../../core/api/enquiries.models';
import { Session } from '../../../core/session/session';
import { EnquiryList } from '../shared/enquiry-list';
import { EnquiryThread } from '../shared/enquiry-thread';
import { LastThread } from '../shared/last-thread';
import { catererFilteredSubtitle, inboxSubtitle, readFilter, readPage } from '../enquiry-text';

/**
 * A caterer's enquiries, /dashboard/enquiries (browse-inbox design): the list,
 * and on large screens the first unread enquiry beside it (L2-036.1).
 */
@Component({
  selector: 'app-enquiries-page',
  imports: [RouterLink, Alert, EMPTY_STATE, Thread, EnquiryList, EnquiryThread],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './enquiries.page.html',
})
export class EnquiriesPage {
  private readonly api = inject(EnquiriesApi);
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });
  private readonly lastThread = inject(LastThread);
  protected readonly user = inject(Session).user;

  protected readonly filter = computed(() => readFilter(this.params().get('status')));
  protected readonly page = computed(() => readPage(this.params().get('page')));
  protected readonly inbox = rxResource({
    params: () => ({ status: this.filter(), page: this.page() }),
    stream: ({ params }) => this.api.inbox(params),
  });
  protected readonly view = computed(() => (this.inbox.hasValue() ? this.inbox.value() : undefined));
  protected readonly failed = computed(() => !!this.inbox.error());
  protected readonly none = computed(() => this.view()?.counts.all === 0);
  protected readonly noResults = computed(() => this.view()?.total === 0);
  protected readonly subtitle = computed(() => {
    const v = this.view();
    if (!v) return '';
    if (v.counts.all === 0) return $localize`:@@enquiries.nothingYet:Nothing yet`;
    const f = this.filter();
    return f ? catererFilteredSubtitle(f, v.total, v.unread) : inboxSubtitle(v.counts, v.unread);
  });
  protected readonly listLabel = computed(() => $localize`:@@enquiries.listLabel:${this.user()?.caterer?.name ?? ''}:business: enquiries`);
  protected readonly emptyText = computed(
    () => $localize`:@@enquiries.emptyText:When a customer asks about an event, it lands here and we email ${this.user()?.email ?? ''}:email:.`,
  );
  protected readonly pageHref = computed(() => `/caterers/${this.user()?.caterer?.slug ?? ''}`);

  /** The enquiry beside the list: the first unread on this page, else the newest. Previewing does not mark it read. */
  protected readonly selectedId = computed(() => {
    const items = this.view()?.items ?? [];
    return (items.find((r) => r.unread) ?? items[0])?.id ?? null;
  });
  protected readonly pane = rxResource({
    params: () => this.selectedId() ?? undefined,
    stream: ({ params }) => this.api.thread(params, { markRead: false }),
  });
  protected readonly paneThread = linkedSignal(() => (this.pane.hasValue() ? this.pane.value() : undefined));

  private readonly list = viewChild(EnquiryList);

  constructor() {
    afterRenderEffect(() => {
      const list = this.list();
      if (list && this.view()) {
        const id = this.lastThread.take();
        if (id) list.focusRow(id);
      }
    });
  }

  protected changed(t: ThreadView): void {
    this.paneThread.set(t);
    this.inbox.reload();
  }

  protected retry(): void {
    this.inbox.reload();
  }
}

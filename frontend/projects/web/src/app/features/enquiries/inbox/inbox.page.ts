import { ChangeDetectionStrategy, Component, afterRenderEffect, computed, effect, inject, signal, viewChild } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY_STATE, Icon, ThreadPlaceholder } from '@sweet-hand/components';
import { EnquiriesApi } from '../../../core/api/enquiries-api';
import { time } from '../../../core/format/format';
import { problemOf, reference } from '../../../core/forms/problem';
import { Connection } from '../shared/connection';
import { EnquiryList } from '../shared/enquiry-list';
import { LastThread } from '../shared/last-thread';
import { filteredSubtitle, inboxSubtitle, readFilter, readPage } from '../enquiry-text';

/** The customer's inbox, /inbox (docs/detailed-designs/enquiries/browse-inbox). */
@Component({
  selector: 'app-inbox-page',
  imports: [RouterLink, EMPTY_STATE, Icon, EnquiryList, ThreadPlaceholder],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inbox.page.html',
})
export class InboxPage {
  private readonly api = inject(EnquiriesApi);
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });
  protected readonly online = inject(Connection).online;

  protected readonly filter = computed(() => readFilter(this.params().get('status')));
  protected readonly page = computed(() => readPage(this.params().get('page')));
  protected readonly inbox = rxResource({
    params: () => ({ status: this.filter(), page: this.page() }),
    stream: ({ params }) => this.api.inbox(params),
  });
  protected readonly view = computed(() => (this.inbox.hasValue() ? this.inbox.value() : undefined));
  protected readonly failure = computed(() => {
    const error = this.inbox.error();
    return error ? { reference: reference(problemOf(error).problem) } : null;
  });
  /** No enquiries at all, whatever the filter: the first-run state. */
  protected readonly none = computed(() => this.view()?.counts.all === 0);
  protected readonly subtitle = computed(() => {
    const v = this.view();
    if (!v) return '';
    const f = this.filter();
    return f ? filteredSubtitle(f, v.total) : inboxSubtitle(v.counts, v.unread);
  });
  /** When the inbox was last loaded, for the offline banner. */
  protected readonly loadedAt = signal('');
  protected readonly offlineText = computed(() =>
    $localize`:@@inbox.offlineText:Showing your inbox as of ${this.loadedAt()}:time: Replies can’t be sent until you reconnect.`,
  );
  /** Three photos from the customer's own threads (message CRD, `sh-thread-placeholder`). */
  protected readonly placeholderPhotos = computed(() => {
    const photos = (this.view()?.items ?? []).flatMap((r) => (r.otherParty.kind === 'caterer' ? [r.otherParty.photo] : []));
    const [a, b, c] = [photos[1] ?? photos[0], photos[0], photos[photos.length - 1]];
    return a && b && c ? [{ src: a, size: 72 as const }, { src: b, size: 104 as const }, { src: c, size: 72 as const }] : [];
  });

  private readonly list = viewChild(EnquiryList);
  private readonly lastThread = inject(LastThread);

  constructor() {
    effect(() => {
      if (this.view()) this.loadedAt.set(time(new Date()));
    });
    // Back from a thread, focus returns to its row so a long inbox does not start over (inbox-row AC-10).
    afterRenderEffect(() => {
      const list = this.list();
      if (list && this.view()) {
        const id = this.lastThread.take();
        if (id) list.focusRow(id);
      }
    });
  }

  protected retry(): void {
    this.inbox.reload();
  }
}

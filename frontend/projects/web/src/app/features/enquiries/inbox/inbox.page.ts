import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ThreadPlaceholder } from '@sweet-hand/components';
import { EnquiriesApi } from '../../../core/api/enquiries-api';
import { EnquiryList } from '../shared/enquiry-list';
import { filteredSubtitle, inboxSubtitle, readFilter, readPage } from '../enquiry-text';

/** The customer's inbox, /inbox (docs/detailed-designs/enquiries/browse-inbox). */
@Component({
  selector: 'app-inbox-page',
  imports: [EnquiryList, ThreadPlaceholder],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inbox.page.html',
})
export class InboxPage {
  private readonly api = inject(EnquiriesApi);
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });

  protected readonly filter = computed(() => readFilter(this.params().get('status')));
  protected readonly page = computed(() => readPage(this.params().get('page')));
  protected readonly inbox = rxResource({
    params: () => ({ status: this.filter(), page: this.page() }),
    stream: ({ params }) => this.api.inbox(params),
  });
  protected readonly view = computed(() => (this.inbox.hasValue() ? this.inbox.value() : undefined));
  protected readonly subtitle = computed(() => {
    const v = this.view();
    if (!v) return '';
    const f = this.filter();
    return f ? filteredSubtitle(f, v.total) : inboxSubtitle(v.counts, v.unread);
  });
  /** Three photos from the customer's own threads (message CRD, `sh-thread-placeholder`). */
  protected readonly placeholderPhotos = computed(() => {
    const photos = (this.view()?.items ?? []).flatMap((r) => (r.otherParty.kind === 'caterer' ? [r.otherParty.photo] : []));
    const [a, b, c] = [photos[1] ?? photos[0], photos[0], photos[photos.length - 1]];
    return a && b && c ? [{ src: a, size: 72 as const }, { src: b, size: 104 as const }, { src: c, size: 72 as const }] : [];
  });
}

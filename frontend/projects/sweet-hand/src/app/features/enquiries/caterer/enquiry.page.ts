import { ChangeDetectionStrategy, Component, afterRenderEffect, computed, effect, inject, input, linkedSignal, untracked, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Alert, EMPTY_STATE, Thread } from '@sweet-hand/components';
import { problemOf } from '../../../core/forms/problem';
import { Session } from '../../../core/session/session';
import { EnquiryList } from '../shared/enquiry-list';
import { EnquiryThread } from '../shared/enquiry-thread';
import { LastThread } from '../shared/last-thread';
import { EnquiriesService, type ThreadView } from '@sweet-hand/api';
import { paths } from '../../../core/routing/paths';

/** One enquiry for the caterer, /dashboard/enquiries/:id (reply-in-thread design; docs/mocks/pages/dashboard-enquiry). */
@Component({
  selector: 'app-enquiry-page',
  imports: [RouterLink, Alert, EMPTY_STATE, Thread, EnquiryList, EnquiryThread],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './enquiry.page.html',
  styleUrl: './enquiry.page.css',
})
export class EnquiryPage {
  protected readonly paths = paths;
  private readonly api = inject(EnquiriesService);
  private readonly session = inject(Session);
  private readonly lastThread = inject(LastThread);

  readonly id = input.required<string>();

  protected readonly backLink = { href: paths.dashboard.enquiries, label: $localize`:@@nav.enquiries:Enquiries` };
  protected readonly listLabel = computed(() => $localize`:@@enquiries.listLabel:${this.session.user()?.caterer?.name ?? ''}:business: enquiries`);
  protected readonly threadResource = rxResource({ params: () => this.id(), stream: ({ params }) => this.api.thread(params) });
  protected readonly thread = linkedSignal(() => (this.threadResource.hasValue() ? this.threadResource.value() : undefined));
  protected readonly failure = computed(() => {
    const error = this.threadResource.error();
    return error ? { notFound: problemOf(error).status === 404 } : null;
  });
  protected readonly list = rxResource({
    params: () => (this.threadResource.hasValue() || this.failure() ? { status: null, page: 1 } : undefined),
    stream: ({ params }) => this.api.inbox(params),
  });
  protected readonly listView = computed(() => (this.list.hasValue() ? this.list.value() : undefined));

  private readonly threadView = viewChild(EnquiryThread);

  constructor() {
    effect(() => {
      const t = this.thread();
      if (!t) return;
      untracked(() => {
        this.lastThread.remember(t.id);
        void this.session.refresh();
      });
    });
    let focused: string | null = null;
    afterRenderEffect(() => {
      const view = this.threadView();
      const t = this.thread();
      if (view && t && focused !== t.id) {
        focused = t.id;
        view.focusTitle();
      }
    });
  }

  protected changed(t: ThreadView): void {
    this.thread.set(t);
    this.list.reload();
  }

  protected retry(): void {
    this.threadResource.reload();
  }
}

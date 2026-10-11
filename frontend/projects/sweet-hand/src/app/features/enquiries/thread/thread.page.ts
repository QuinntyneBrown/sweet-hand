import { ChangeDetectionStrategy, Component, afterRenderEffect, computed, effect, inject, input, linkedSignal, untracked, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EMPTY_STATE, Icon, Thread } from '@sweet-hand/components';
import { problemOf, reference } from '../../../core/forms/problem';
import { Session } from '../../../core/session/session';
import { EnquiryList } from '../shared/enquiry-list';
import { EnquiryThread } from '../shared/enquiry-thread';
import { LastThread } from '../shared/last-thread';
import { ENQUIRIES_SERVICE, ThreadView } from '@sweet-hand/api';

/** A customer's enquiry thread beside their inbox, /inbox/:id (reply-in-thread and browse-inbox designs). */
@Component({
  selector: 'app-thread-page',
  imports: [RouterLink, EMPTY_STATE, Icon, Thread, EnquiryList, EnquiryThread],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './thread.page.html',
  styleUrl: './thread.page.css',
})
export class ThreadPage {
  private readonly api = inject(ENQUIRIES_SERVICE);
  private readonly session = inject(Session);
  private readonly lastThread = inject(LastThread);

  readonly id = input.required<string>();

  protected readonly backLink = { href: '/inbox', label: $localize`:@@nav.inbox:Inbox` };
  protected readonly threadResource = rxResource({ params: () => this.id(), stream: ({ params }) => this.api.thread(params) });
  /** The thread as loaded, then as replies and actions change it. */
  protected readonly thread = linkedSignal(() => (this.threadResource.hasValue() ? this.threadResource.value() : undefined));
  protected readonly failure = computed(() => {
    const error = this.threadResource.error();
    if (!error) return null;
    const { status, problem } = problemOf(error);
    return { notFound: status === 404, reference: reference(problem) };
  });
  /** The list loads once the thread has been opened (and so marked read). */
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

  /** A reply or an action changed the thread: its row moves and changes in the list too (L2-031.3). */
  protected changed(t: ThreadView): void {
    this.thread.set(t);
    this.list.reload();
  }

  protected retry(): void {
    this.threadResource.reload();
  }
}

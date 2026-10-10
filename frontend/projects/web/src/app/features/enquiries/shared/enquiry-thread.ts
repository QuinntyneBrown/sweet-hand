import { ChangeDetectionStrategy, Component, computed, input, signal, viewChild } from '@angular/core';
import { Icon, Message, MessageList, ReplyBox, Thread, ThreadActionsSlot, graphemeLength } from '@sweet-hand/components';
import type { ThreadView } from '../../../core/api/enquiries.models';
import { count } from '../../../core/format/format';
import { messageTime, statusLabel, statusTone } from '../enquiry-text';
import { REPLY_MAX, actionsFor, canReply, fitWarningText, otherName, otherPartyGone, otherShortName, partyPicture, sentLine, summaryRows, threadEntries } from '../thread-view';

/**
 * One enquiry thread for either party: head, actions, summary, messages and
 * the reply box or closed note (reply-in-thread design; message CRD).
 */
@Component({
  selector: 'app-enquiry-thread',
  imports: [Icon, Message, MessageList, ReplyBox, Thread, ThreadActionsSlot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './enquiry-thread.html',
})
export class EnquiryThread {
  readonly thread = input.required<ThreadView>();
  readonly headingLevel = input<1 | 2>(1);
  readonly backLink = input<{ href: string; label: string } | null>(null);

  private readonly threadEl = viewChild.required(Thread);

  protected readonly customerView = computed(() => this.thread().viewer === 'customer');
  protected readonly title = computed(() => otherName(this.thread()));
  protected readonly party = computed(() => partyPicture(this.thread()));
  protected readonly tone = computed(() => statusTone(this.thread().status));
  protected readonly status = computed(() => statusLabel(this.thread().status));
  protected readonly viewLink = computed(() =>
    this.customerView() ? { href: `/caterers/${this.thread().caterer.slug}`, label: $localize`:@@thread.viewCaterer:View caterer` } : null,
  );
  protected readonly subline = computed(() => (this.customerView() ? null : sentLine(this.thread())));
  protected readonly actions = computed(() => actionsFor(this.thread()));
  protected readonly hasActions = computed(() => Object.values(this.actions()).some(Boolean));
  protected readonly summary = computed(() => summaryRows(this.thread()));
  protected readonly enquiryBy = computed(() => {
    const t = this.thread();
    return `${t.customer?.name ?? ''} · ${messageTime(t.sentAt)}`;
  });
  protected readonly warnings = computed(() => this.thread().fitWarnings.map(fitWarningText));
  protected readonly entries = computed(() => threadEntries(this.thread()));
  protected readonly canReply = computed(() => canReply(this.thread()));
  protected readonly gone = computed(() => otherPartyGone(this.thread()));
  protected readonly waiting = computed(() => this.customerView() && this.thread().status === 'Open');
  protected readonly waitingText = computed(() => $localize`:@@thread.waiting:${this.thread().caterer.name}:name: hasn’t replied yet. We’ll email you when they do.`);
  protected readonly privateText = computed(() => $localize`:@@thread.private:${this.thread().caterer.name}:name: sees your name, not your email or phone.`);
  protected readonly replyLabel = computed(() =>
    this.customerView() ? $localize`:@@thread.yourReply:Your reply` : $localize`:@@thread.replyTo:Reply to ${otherShortName(this.thread())}:name:`,
  );
  protected readonly replyHelp = computed(() =>
    this.customerView()
      ? $localize`:@@thread.replyHelp:${this.thread().caterer.name}:name: gets an email. Links show as plain text.`
      : $localize`:@@thread.replyHelpCaterer:${otherShortName(this.thread())}:name: sees ${this.thread().caterer.name}:business:, not your email or phone.`,
  );
  protected readonly sendLabel = computed(() => (this.customerView() ? $localize`:@@thread.sendReply:Send reply` : $localize`:@@thread.send:Send`));

  protected readonly draft = signal('');
  protected readonly counter = computed(() => `${count(graphemeLength(this.draft()))} / ${count(REPLY_MAX)}`);

  focusTitle(): void {
    this.threadEl().focusTitle();
  }
}

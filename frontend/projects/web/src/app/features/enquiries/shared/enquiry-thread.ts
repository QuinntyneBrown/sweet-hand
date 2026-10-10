import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, model, signal, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Icon, Message, MessageList, ReplyBox, Thread, ThreadActionsSlot, ToastNotifier, graphemeLength } from '@sweet-hand/components';
import { EnquiriesApi } from '../../../core/api/enquiries-api';
import type { ThreadView } from '../../../core/api/enquiries.models';
import { count } from '../../../core/format/format';
import { problemOf } from '../../../core/forms/problem';
import { messageTime, statusLabel, statusTone } from '../enquiry-text';
import { CloseEnquiryDialog } from './close-enquiry-dialog';
import { DeclineEnquiryDialog } from './decline-enquiry-dialog';
import { ShareContactDialog } from './share-contact-dialog';
import {
  REPLY_MAX,
  actionsFor,
  canReply,
  fitWarningText,
  otherName,
  otherPartyGone,
  otherShortName,
  partyPicture,
  replyError,
  sentLine,
  summaryRows,
  threadEntries,
} from '../thread-view';

interface Outgoing {
  id: number;
  text: string;
  state: 'pending' | 'failed';
}

let nextOutgoing = 0;

/**
 * One enquiry thread for either party: head, actions, summary, messages and
 * the reply box or closed note (reply-in-thread design; message CRD).
 */
@Component({
  selector: 'app-enquiry-thread',
  imports: [Icon, Message, MessageList, ReplyBox, Thread, ThreadActionsSlot, CloseEnquiryDialog, DeclineEnquiryDialog, ShareContactDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './enquiry-thread.html',
})
export class EnquiryThread {
  private readonly api = inject(EnquiriesApi);
  private readonly toasts = inject(ToastNotifier);
  private readonly injector = inject(Injector);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  /** The thread; replies and actions update it and emit `threadChange`. */
  readonly thread = model.required<ThreadView>();
  readonly headingLevel = input<1 | 2>(1);
  readonly backLink = input<{ href: string; label: string } | null>(null);

  private readonly threadEl = viewChild.required(Thread);
  private readonly replyBox = viewChild(ReplyBox);

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
  protected readonly summary = computed(() => summaryRows(this.thread()));
  protected readonly enquiryBy = computed(() => `${this.thread().customer?.name ?? ''} · ${messageTime(this.thread().sentAt)}`);
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
  protected readonly you = $localize`:@@thread.you:You`;
  protected readonly summaryTitle = $localize`:@@thread.replyNotSent:Your reply wasn’t sent`;

  protected readonly draft = signal('');
  protected readonly counter = computed(() => `${count(graphemeLength(this.draft()))} / ${count(REPLY_MAX)}`);
  protected readonly replyErrorText = signal<string | null>(null);
  /** Replies on their way or that failed, shown after the thread's own entries. */
  protected readonly outbox = signal<Outgoing[]>([]);
  protected readonly sending = computed(() => this.outbox().some((o) => o.state === 'pending'));
  protected readonly hasMessages = computed(() => this.entries().length > 0 || this.outbox().length > 0);

  /** The dialog open over the thread, and where focus goes when it closes (L2-067.4). */
  protected readonly dialog = signal<'share' | 'close' | 'decline' | null>(null);
  protected readonly returnTo = signal<HTMLElement | null>(null);

  focusTitle(): void {
    this.threadEl().focusTitle();
  }

  protected openDialog(kind: 'share' | 'close' | 'decline', event: Event): void {
    this.returnTo.set(event.currentTarget as HTMLElement);
    this.dialog.set(kind);
  }

  protected closeDialog(): void {
    this.dialog.set(null);
  }

  /** Declining was refused because Kendra already replied elsewhere: offer closing instead (L2-033.3). */
  protected closeInstead(): void {
    this.returnTo.set(this.headingElement());
    this.dialog.set('close');
  }

  private headingElement(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('.thread__title [tabindex="-1"]');
  }

  /** An action succeeded: show the thread as it is now; the action that opened the dialog may be gone, so focus goes to the heading. */
  protected acted(t: ThreadView): void {
    const kind = this.dialog();
    this.returnTo.set(this.headingElement());
    this.thread.set(t);
    this.dialog.set(null);
    if (kind === 'share') {
      this.toasts.show({
        tone: 'success',
        title: $localize`:@@toast.shared:Contact details shared`,
        text: $localize`:@@toast.sharedText:${otherShortName(t)}:name: can now see your email and phone in this enquiry.`,
      });
    }
  }

  protected send(text: string): void {
    if (this.sending()) return;
    const error = replyError(text);
    this.replyErrorText.set(error);
    if (error) {
      // The customer's form has a summary; the caterer's single field takes focus itself (mocks).
      afterNextRender(() => (this.customerView() ? this.replyBox()?.focusSummary() : this.replyBox()?.focusField()), { injector: this.injector });
      return;
    }
    const item: Outgoing = { id: ++nextOutgoing, text, state: 'pending' };
    this.outbox.update((list) => [...list, item]);
    this.draft.set('');
    void this.deliver(item);
  }

  protected retry(id: number): void {
    const item = this.outbox().find((o) => o.id === id);
    if (!item || item.state !== 'failed' || this.sending()) return;
    this.setState(id, 'pending');
    afterNextRender(() => this.replyBox()?.focusField(), { injector: this.injector });
    void this.deliver(item);
  }

  private setState(id: number, state: Outgoing['state']): void {
    this.outbox.update((list) => list.map((o) => (o.id === id ? { ...o, state } : o)));
  }

  private drop(id: number): void {
    this.outbox.update((list) => list.filter((o) => o.id !== id));
  }

  private async deliver(item: Outgoing): Promise<void> {
    const t = this.thread();
    try {
      const result = await firstValueFrom(this.api.reply(t.id, item.text));
      this.drop(item.id);
      const current = this.thread();
      this.thread.set({ ...current, status: result.status, entries: [...current.entries, result.entry] });
      const name = otherShortName(current);
      if (result.emailDelayed) {
        this.toasts.show({
          tone: 'info',
          title: $localize`:@@toast.emailsLate:Emails are running late`,
          text: $localize`:@@toast.emailsLateText:Your reply is saved. ${name}:name: will get the email as soon as our mail service catches up.`,
        });
      } else {
        this.toasts.show({ tone: 'success', title: $localize`:@@toast.replySent:Reply sent`, text: $localize`:@@toast.replySentText:${name}:name: will get an email.` });
      }
      afterNextRender(() => this.replyBox()?.focusField(), { injector: this.injector });
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 409) {
        // Closed or declined meanwhile (L2-033.5): show the thread as it is now.
        this.drop(item.id);
        this.toasts.show({
          tone: 'danger',
          title: $localize`:@@toast.replyNotSent:Your reply wasn’t sent`,
          text: $localize`:@@toast.replyClosed:This enquiry has closed, so no more messages can be sent.`,
        });
        const fresh = await firstValueFrom(this.api.thread(t.id, { markRead: false })).catch(() => null);
        if (fresh) this.thread.set(fresh);
      } else if (status === 400) {
        this.drop(item.id);
        this.draft.set(item.text);
        this.replyErrorText.set(problem.errors?.['reply']?.[0] ?? replyError(item.text));
      } else {
        this.setState(item.id, 'failed');
        this.toasts.show({
          tone: 'danger',
          title: $localize`:@@toast.replyNotSent:Your reply wasn’t sent`,
          text: $localize`:@@toast.replyFailed:Check your connection, then try again. Your message is still in the box.`,
          action: { label: $localize`:@@common.tryAgain:Try again`, run: () => this.retry(item.id) },
        });
      }
    }
  }
}

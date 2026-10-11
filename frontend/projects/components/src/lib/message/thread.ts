import { ChangeDetectionStrategy, Component, computed, contentChildren, ElementRef, input, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import { Status } from '../status/status';
import type { StatusTone } from '../status/status-tone';
import type { ThreadParty } from './thread-party';
import { ThreadActionsSlot } from './thread-actions-slot';

/**
 * One enquiry's conversation: who it is with, where it stands, the messages and
 * how it ends (docs/specs/components/message.md, `sh-thread`).
 */
@Component({
  selector: 'sh-thread',
  imports: [RouterLink, Icon, Status],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './thread.html',
})
export class Thread {
  readonly title = input('');
  readonly titleId = input('thread-title');
  readonly headingLevel = input<1 | 2>(1);
  readonly party = input<ThreadParty>({ kind: 'gone' });
  readonly statusTone = input<StatusTone | null>(null);
  readonly statusLabel = input('');
  readonly viewLink = input<{ href: string; label: string } | null>(null);
  readonly subline = input<string | null>(null);
  readonly backLink = input<{ href: string; label: string } | null>(null);
  readonly busy = input(false);
  readonly loadingLabel = input('');

  protected readonly actions = contentChildren(ThreadActionsSlot);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly photoSrc = computed(() => {
    const p = this.party();
    return p.kind === 'photo' ? p.src : '';
  });
  protected readonly initialsText = computed(() => {
    const p = this.party();
    return p.kind === 'initials' ? p.text : '';
  });

  /** Focuses the heading, e.g. when a thread is opened from the inbox. */
  focusTitle(): void {
    this.heading()?.nativeElement.focus();
  }
}


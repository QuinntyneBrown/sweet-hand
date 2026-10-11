import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Status } from '../status/status';
import type { StatusTone } from '../status/status-tone';
import type { InboxRowPicture } from './inbox-row-picture';

/**
 * One enquiry in an inbox: the whole row is one link to its thread
 * (docs/specs/components/inbox-row.md). The host sits directly in the `ul`,
 * so it is the list item; the `li` it renders keeps the CRD markup as presentation.
 */
@Component({
  selector: 'sh-inbox-row',
  imports: [RouterLink, Status],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents', role: 'listitem' },
  templateUrl: './inbox-row.html',
})
export class InboxRow {
  readonly href = input.required<string>();
  readonly name = input.required<string>();
  readonly picture = input.required<InboxRowPicture>();
  readonly time = input.required<string>();
  readonly datetime = input<string | null>(null);
  readonly summary = input.required<string>();
  readonly statusTone = input.required<Extract<StatusTone, 'open' | 'replied' | 'declined' | 'closed'>>();
  readonly statusLabel = input.required<string>();
  readonly unread = input(false);
  readonly unreadLabel = input('');
  readonly current = input<'page' | 'true' | null>(null);

  readonly opened = output<MouseEvent>();

  private readonly link = viewChild.required<ElementRef<HTMLAnchorElement>>('link');

  protected readonly cls = computed(() => (this.unread() ? 'inbox-row inbox-row--unread' : 'inbox-row'));
  protected readonly unreadText = computed(() => `${this.unreadLabel()} `);
  protected readonly photoSrc = computed(() => {
    const p = this.picture();
    return p.kind === 'photo' ? p.src : '';
  });
  protected readonly initialsText = computed(() => {
    const p = this.picture();
    return p.kind === 'initials' ? p.text : '';
  });

  /** Focuses the row link, e.g. when the person comes back from its thread on a phone. */
  focus(): void {
    this.link().nativeElement.focus();
  }
}


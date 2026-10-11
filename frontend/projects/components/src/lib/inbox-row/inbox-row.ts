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
  template: `
    <li role="none">
      <a #link [class]="cls()" [routerLink]="href()" [attr.aria-current]="current()" (click)="opened.emit($event)"
        >@switch (picture().kind) {
          @case ('photo') {
            <span class="photo"><img [src]="photoSrc()" alt="" width="48" height="48" loading="lazy" /></span>
          }
          @case ('initials') {
            <span class="avatar" aria-hidden="true">{{ initialsText() }}</span>
          }
          @default {
            <span class="avatar" aria-hidden="true"
              ><svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg
            ></span>
          }
        }<span class="inbox-row__name"
          >@if (unread()) {<span class="unread-dot" aria-hidden="true"></span><span class="visually-hidden">{{ unreadText() }}</span>}{{ name() }}</span
        ><span class="inbox-row__time"
          >@if (datetime()) {<time [attr.datetime]="datetime()">{{ time() }}</time>} @else {{{ time() }}}</span
        ><span class="inbox-row__meta">{{ summary() }}</span><sh-status [tone]="statusTone()" [label]="statusLabel()" extraClass="inbox-row__status"
      /></a>
    </li>
  `,
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


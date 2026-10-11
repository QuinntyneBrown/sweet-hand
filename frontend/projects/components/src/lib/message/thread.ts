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
  template: `
    <article class="thread" [attr.aria-labelledby]="titleId()" [attr.aria-busy]="busy() ? 'true' : null">
      @if (backLink(); as b) {
        <a class="eyebrow until-lg" [routerLink]="b.href"><svg shIcon="chevron-left" class="icon--sm"></svg>{{ b.label }}</a>
      }
      @if (busy()) {
        <div class="thread__head">
          <span class="skeleton skeleton--circle" style="width: 3.5rem; height: 3.5rem" aria-hidden="true"></span>
          <div class="thread__title">
            @if (headingLevel() === 1) {
              <h1 [id]="titleId()" tabindex="-1"><span class="visually-hidden">{{ loadingLabel() }}</span><span class="skeleton skeleton--text" style="width: 10rem" aria-hidden="true"></span></h1>
            } @else {
              <h2 [id]="titleId()" tabindex="-1"><span class="visually-hidden">{{ loadingLabel() }}</span><span class="skeleton skeleton--text" style="width: 10rem" aria-hidden="true"></span></h2>
            }
            <span class="skeleton skeleton--text" style="width: 6rem" aria-hidden="true"></span>
          </div>
        </div>
        <div class="enquiry-summary" aria-hidden="true">
          <span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span>
        </div>
        <div class="message" aria-hidden="true"><span class="skeleton skeleton--rect" style="height: 4.5rem; width: 22rem; max-width: 100%"></span></div>
      } @else {
        <div class="thread__head">
          @switch (party().kind) {
            @case ('photo') {
              <span class="photo"><img [src]="photoSrc()" alt="" width="56" height="56" /></span>
            }
            @case ('initials') {
              <span class="avatar" aria-hidden="true">{{ initialsText() }}</span>
            }
            @default {
              <span class="avatar" aria-hidden="true"
                ><svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg
              ></span>
            }
          }
          <div class="thread__title">
            @if (headingLevel() === 1) {
              <h1 #heading [id]="titleId()" tabindex="-1">{{ title() }}</h1>
            } @else {
              <h2 #heading [id]="titleId()" tabindex="-1">{{ title() }}</h2>
            }
            <p class="thread__status">
              <sh-status [tone]="statusTone()" [label]="statusLabel()" />
              @if (viewLink(); as v) {
                <a class="link--standalone" [routerLink]="v.href">{{ v.label }}</a>
              }
              @if (subline()) {
                <span>{{ subline() }}</span>
              }
            </p>
          </div>
        </div>
        @if (actions().length) {
          <div class="thread__actions"><ng-content select="[slot=actions]" /></div>
        }
        <ng-content select="[slot=summary]" />
        <ng-content />
        <ng-content select="[slot=ending]" />
      }
    </article>
  `,
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


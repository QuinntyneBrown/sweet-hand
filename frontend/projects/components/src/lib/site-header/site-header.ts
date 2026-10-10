import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';

export interface SiteNavLink {
  label: string;
  href: string;
  current?: boolean;
  count?: number;
  /** Hidden text after the badge, e.g. "1 unread enquiry"; required when count > 0. */
  countLabel?: string;
}

export interface SiteNavShortcut {
  label: string;
  href: string;
  current?: boolean;
  count?: number;
  /** The short count for the icon's name: "1 unread". */
  countLabel?: string;
}

export interface SiteHeaderAccount {
  initials: string;
  label: string;
}

/** The site header (docs/specs/components/site-header.md). Holds no strings of its own. */
@Component({
  selector: 'sh-site-header',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ':host { display: contents; }',
  template: `
    <header class="site-header">
      <a class="wordmark" [routerLink]="homeHref()">{{ brandName() }}@if (tag() && !minimal()) {&ngsp;<span class="wordmark__tag">{{ tag() }}</span>}</a>
      @if (!minimal()) {
        <nav class="site-nav" aria-label="Primary">
          @for (link of links(); track link.href) {
            <a class="site-nav__link site-nav__extra" [routerLink]="link.href" [attr.aria-current]="link.current ? 'page' : null" [attr.aria-label]="link.count ? link.label + ', ' + link.countLabel : null"
              >{{ link.label }}@if (link.count) {&ngsp;<span class="badge badge--count" aria-hidden="true">{{ badge(link.count) }}</span><span class="visually-hidden">, {{ link.countLabel }}</span>
              }</a
            >
          }
          @if (searchLabel(); as label) {
            <button #search class="icon-btn" type="button" [attr.aria-label]="label" aria-haspopup="dialog" [attr.aria-expanded]="searchOpen()" (click)="searchRequested.emit()"><svg shIcon="search"></svg></button>
          }
          @if (inboxShortcut(); as s) {
            <a class="icon-btn site-nav__menu" [routerLink]="s.href" [attr.aria-label]="s.count ? s.label + ', ' + s.countLabel : s.label" [attr.aria-current]="s.current ? 'page' : null"
              ><svg shIcon="mail"></svg>@if (s.count) {<span class="badge badge--count" aria-hidden="true">{{ badge(s.count) }}</span>}</a
            >
          }
          <button #menu class="icon-btn site-nav__menu" type="button" [attr.aria-label]="menuLabel()" aria-haspopup="dialog" [attr.aria-expanded]="menuOpen()" (click)="menuRequested.emit()"><svg shIcon="menu"></svg></button>
          @if (account(); as a) {
            <button #account class="avatar site-nav__extra" type="button" [attr.aria-label]="a.label" aria-haspopup="menu" [attr.aria-expanded]="accountOpen()" (click)="accountRequested.emit()">{{ a.initials }}</button>
          }
        </nav>
      }
    </header>
  `,
})
export class SiteHeader {
  readonly brandName = input.required<string>();
  readonly homeHref = input.required<string>();
  readonly tag = input<string | null>(null);
  readonly minimal = input(false);
  readonly links = input<SiteNavLink[]>([]);
  readonly inboxShortcut = input<SiteNavShortcut | null>(null);
  readonly searchLabel = input<string | null>(null);
  readonly searchOpen = input(false);
  readonly menuLabel = input('');
  readonly menuOpen = input(false);
  readonly account = input<SiteHeaderAccount | null>(null);
  readonly accountOpen = input(false);

  readonly menuRequested = output<void>();
  readonly searchRequested = output<void>();
  readonly accountRequested = output<void>();

  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menu');
  private readonly searchButton = viewChild<ElementRef<HTMLButtonElement>>('search');
  private readonly accountButton = viewChild<ElementRef<HTMLButtonElement>>('account');

  protected badge(count: number): string {
    return count > 99 ? '99+' : String(count);
  }

  /** The trigger an overlay returns focus to when it closes (L2-067.4). */
  trigger(which: 'menu' | 'search' | 'account'): HTMLElement | null {
    const ref = which === 'menu' ? this.menuButton() : which === 'search' ? this.searchButton() : this.accountButton();
    return ref?.nativeElement ?? null;
  }

  focusTrigger(which: 'menu' | 'search' | 'account'): void {
    this.trigger(which)?.focus();
  }
}

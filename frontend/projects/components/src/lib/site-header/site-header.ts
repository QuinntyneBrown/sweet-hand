import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import type { SiteNavLink } from './site-nav-link';
import type { SiteNavShortcut } from './site-nav-shortcut';
import type { SiteHeaderAccount } from './site-header-account';

/** The site header (docs/specs/components/site-header.md). Holds no strings of its own. */
@Component({
  selector: 'sh-site-header',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './site-header.html',
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

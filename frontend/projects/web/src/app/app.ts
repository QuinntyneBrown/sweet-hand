import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AccountMenu, Footer, Icon, Sheet, SiteHeader, ToastRegion, type MenuItemEntry } from '@sweet-hand/components';
import { Session } from './core/session/session';
import { SearchDialog } from './features/discovery/search/search-dialog';
import {
  accountSecondLine,
  areaTag,
  footerLine,
  footerLinks,
  headerLinks,
  homeHref,
  inboxShortcut,
  initials,
  markCurrent,
  signedInLine,
  siteMenuLinks,
  smallLinks,
} from './shell/navigation';

/** The application shell: skip link, header, the page's main landmark, footer and the shell's overlays. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, SiteHeader, Footer, Sheet, AccountMenu, Icon, SearchDialog, ToastRegion],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly session = inject(Session);

  private readonly header = viewChild.required(SiteHeader);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  private readonly leaf = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => {
        let r = this.route.snapshot;
        while (r.firstChild) r = r.firstChild;
        return { url: this.router.url, data: r.data };
      }),
    ),
    { initialValue: { url: this.router.url, data: {} as Record<string, unknown> } },
  );

  /** Each route names the classes its main landmark carries in the mocks (`data.mainClass`). */
  protected readonly mainClass = computed(() => (this.leaf().data['mainClass'] as string | undefined) ?? '');
  /** Mid-authentication pages show only the wordmark (site-header D-4). */
  protected readonly minimal = computed(() => this.leaf().data['chrome'] === 'minimal');

  protected readonly user = this.session.user;
  protected readonly home = computed(() => homeHref(this.user()));
  protected readonly tag = computed(() => areaTag(this.user()));
  protected readonly links = computed(() => markCurrent(headerLinks(this.user(), this.session.unread(), this.session.queueCount()), this.leaf().url));
  protected readonly shortcut = computed(() => {
    const s = inboxShortcut(this.user(), this.session.unread());
    return s && { ...s, current: this.leaf().url.split('?')[0] === s.href };
  });
  protected readonly searchLabel = $localize`:@@header.search:Search by area or postal code`;
  protected readonly canSearch = computed(() => this.user()?.role !== 'Caterer' && this.user()?.role !== 'Operator');
  protected readonly account = computed(() => {
    const u = this.user();
    return u ? { initials: initials(u.displayName), label: $localize`:@@header.accountMenuFor:Account menu for ${u.displayName}:name:` } : null;
  });
  protected readonly menuLinks = computed(() => markCurrent(siteMenuLinks(this.user(), this.session.unread(), this.session.queueCount()), this.leaf().url));
  protected readonly signedIn = computed(() => (this.user() ? signedInLine(this.user()!) : ''));
  protected readonly smallLinks = computed(() => smallLinks(this.user()));
  protected readonly footerLinks = computed(() => markCurrent(footerLinks(this.user()), this.leaf().url).map((l) => ({ ...l, current: l.current && this.leaf().url.split('?')[0] === l.href })));
  protected readonly footerLine = computed(() => footerLine(this.user()));
  protected readonly accountSecondLine = computed(() => (this.user() ? accountSecondLine(this.user()!) : ''));
  protected readonly accountItems = computed<MenuItemEntry[]>(() => {
    const role = this.user()?.role;
    const items: MenuItemEntry[] = [];
    if (role === 'Customer') items.push({ kind: 'item', id: 'inbox', label: $localize`:@@nav.inbox:Inbox`, href: '/inbox', icon: 'mail' });
    if (role === 'Caterer') items.push({ kind: 'item', id: 'dashboard', label: $localize`:@@nav.dashboard:Dashboard`, href: '/dashboard', icon: 'plate' });
    items.push({ kind: 'item', id: 'account', label: $localize`:@@nav.account:Account`, href: '/account', icon: 'lock' });
    items.push({ kind: 'item', id: 'sign-out', label: $localize`:@@nav.signOut:Sign out`, icon: 'sign-out' });
    return items;
  });

  protected readonly menuOpen = signal(false);
  protected readonly accountOpen = signal(false);
  protected readonly searchOpen = signal(false);
  protected readonly accountTrigger = computed(() => (this.accountOpen() ? this.header().trigger('account') : null));

  constructor() {
    // Overlays close when a navigation starts, so one opened while the first page
    // is still loading is not closed when that load finishes.
    this.router.events.pipe(filter((e) => e instanceof NavigationStart)).subscribe(() => {
      this.menuOpen.set(false);
      this.accountOpen.set(false);
      this.searchOpen.set(false);
    });
  }

  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }

  protected menuTrigger(): HTMLElement | null {
    return this.header().trigger('menu');
  }

  protected searchTrigger(): HTMLElement | null {
    return this.header().trigger('search');
  }

  protected onAccountItem(id: string): void {
    if (id === 'sign-out') void this.signOut();
  }

  protected async signOut(): Promise<void> {
    this.menuOpen.set(false);
    await this.session.signOut();
    await this.router.navigateByUrl(this.user()?.role === 'Operator' ? '/sign-in' : '/caterers');
  }
}

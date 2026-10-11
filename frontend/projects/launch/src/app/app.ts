import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { launchSiteConfig } from './launch-site-config';
import { NotifyScroller } from './launch-page/notify-scroller';

/**
 * The launch site's shell (serve-launch-site design): the skip link, the
 * header with the "Get the launch email" button, the page, and the footer.
 */
@Component({
  selector: 'launch-root',
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class LaunchApp {
  protected readonly config = launchSiteConfig;
  private readonly router = inject(Router);
  private readonly scroller = inject(NotifyScroller);

  constructor() {
    const document = inject(DOCUMENT);
    describeSite(inject(Meta), document);
    // Specs and scripts wait for this before interacting: the page has hydrated.
    afterNextRender(() => document.documentElement.setAttribute('data-ready', ''));
  }

  protected get onLaunchPage(): boolean {
    return this.router.url.split(/[?#]/)[0] === '/';
  }

  /** On the launch page the header button scrolls to the form and focuses its heading (L2-094.1). */
  protected goToForm(event: Event): void {
    if (!this.onLaunchPage) return;
    event.preventDefault();
    this.scroller.scrollToNotify();
  }
}

/** Head metadata for sharing and search (L2-093.3). The page `<title>` comes from the route. */
function describeSite(meta: Meta, document: Document): void {
  const title = $localize`:@@launch.documentTitle:Sweet Hand · Opening soon in Toronto and the GTA`;
  const description = $localize`:@@launch.metaDescription:Caribbean caterers in Toronto and the GTA, all in one place. Sweet Hand opens soon: get one email on launch day.`;
  meta.addTags([
    { name: 'description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: `${launchSiteConfig.siteUrl}/` },
    { property: 'og:image', content: `${launchSiteConfig.siteUrl}/og-image.jpg` },
  ]);
  if (!document.head.querySelector('link[rel="canonical"]')) {
    const canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', `${launchSiteConfig.siteUrl}/`);
    document.head.appendChild(canonical);
  }
}

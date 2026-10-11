import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { DOCUMENT, PlatformLocation } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { launchSiteConfig } from './launch-site-config';
import { isPrivacyPath } from './launch-pages';
import { LaunchPage } from './launch-page/launch-page';
import { LaunchPrivacyPage } from './privacy/launch-privacy-page';
import { NotifyScroller } from './launch-page/notify-scroller';

/**
 * The launch site's shell (serve-launch-site design): the skip link, the
 * header with the "Get the launch email" button, the page for the address,
 * and the footer.
 */
@Component({
  selector: 'launch-root',
  imports: [LaunchPage, LaunchPrivacyPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class LaunchApp {
  protected readonly config = launchSiteConfig;
  protected readonly privacy = isPrivacyPath(inject(PlatformLocation).pathname);
  private readonly scroller = inject(NotifyScroller);

  constructor() {
    const document = inject(DOCUMENT);
    inject(Title).setTitle(
      this.privacy ? $localize`:@@launch.privacy.documentTitle:Privacy · Sweet Hand` : $localize`:@@launch.documentTitle:Sweet Hand · Opening soon in Toronto and the GTA`,
    );
    describeSite(inject(Meta), document);
    // Specs and scripts wait for this before interacting: the page has hydrated.
    afterNextRender(() => document.documentElement.setAttribute('data-ready', ''));
  }

  /** On the launch page the header button scrolls to the form and focuses its heading (L2-094.1). */
  protected goToForm(event: Event): void {
    if (this.privacy) return;
    event.preventDefault();
    this.scroller.scrollToNotify();
  }
}

/** Head metadata for sharing and search (L2-093.3). */
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

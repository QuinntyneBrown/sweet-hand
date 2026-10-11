import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { previewText } from './caterer-view';
import { CatererPageView } from '@sweet-hand/api';

const OG = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];

/**
 * Title, meta description, canonical link and Open Graph tags for a caterer
 * page (L2-018.4). Written through Angular's Title and Meta so server
 * rendering can be switched on without page changes (ADR 0001).
 */
@Injectable()
export class CatererPageMetadata {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  write(c: CatererPageView): void {
    const origin = this.document.location.origin;
    const url = `${origin}/caterers/${c.slug}`;
    const description = previewText(c.description);
    this.title.setTitle($localize`:@@caterer.documentTitle:${c.name}:name: · Sweet Hand`);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: c.name });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    const cover = c.photos[0];
    if (cover) this.meta.updateTag({ property: 'og:image', content: new URL(cover.viewerSrc, origin).href });
    else this.meta.removeTag('property="og:image"');
    this.canonical().setAttribute('href', url);
  }

  clear(): void {
    this.meta.removeTag('name="description"');
    for (const p of OG) this.meta.removeTag(`property="${p}"`);
    this.document.head.querySelector('link[rel="canonical"]')?.remove();
  }

  private canonical(): HTMLLinkElement {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    return link;
  }
}

import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, type RouterStateSnapshot } from '@angular/router';
import { documentTitle } from './document-title';

/**
 * Route `title` entries hold the page name only; this adds the site's name.
 * A route whose title already names Sweet Hand sets `data: { titleSuffix: false }`.
 */
@Injectable()
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const name = this.buildTitle(snapshot);
    if (name === undefined) return;
    let leaf = snapshot.root;
    while (leaf.firstChild) leaf = leaf.firstChild;
    this.title.setTitle(leaf.data['titleSuffix'] === false ? name : documentTitle(name));
  }
}

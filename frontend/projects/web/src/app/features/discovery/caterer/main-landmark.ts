import { DOCUMENT, DestroyRef, Injectable, inject } from '@angular/core';

/**
 * The caterer page's classes on the shell's `<main>` change with its state:
 * `container has-sticky-cta` with content (sticky-cta CRD), `container` while
 * loading or failed, none for the removed page, whose system page brings its
 * own container. The shell's route-level `mainClass` cannot express that.
 */
@Injectable()
export class MainLandmark {
  private readonly document = inject(DOCUMENT);
  private added: string[] = [];

  constructor() {
    inject(DestroyRef).onDestroy(() => this.set([]));
  }

  set(classes: string[]): void {
    const main = this.document.getElementById('main');
    if (!main) return;
    for (const c of this.added) if (!classes.includes(c)) main.classList.remove(c);
    for (const c of classes) main.classList.add(c);
    this.added = classes;
  }
}

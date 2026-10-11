import { afterNextRender, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';

/** Reports whether a value cell received any content, so a missing value can say so. */
@Directive({ selector: '[shValueWatch]' })
export class ValueWatch {
  readonly shValueWatch = output<boolean>();

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const check = () => {
        const content = Array.from(el.childNodes).filter((n) => !(n instanceof HTMLElement && n.matches('.enquiry-summary__by, [data-missing]')));
        this.shValueWatch.emit(content.every((n) => n.nodeType === Node.COMMENT_NODE || (n.nodeType === Node.TEXT_NODE && !n.textContent?.trim())));
      };
      check();
      const observer = new MutationObserver(check);
      observer.observe(el, { childList: true, subtree: true, characterData: true });
      destroy.onDestroy(() => observer.disconnect());
    });
  }
}

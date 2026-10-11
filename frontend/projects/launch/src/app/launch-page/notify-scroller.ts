import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Brings the visitor to the sign-up panel (L2-094): smooth scrolling, or a
 * jump when the system asks for reduced motion, then focus on its heading.
 */
@Injectable({ providedIn: 'root' })
export class NotifyScroller {
  private readonly document = inject(DOCUMENT);

  scrollToNotify(): void {
    const section = this.document.getElementById('notify');
    if (!section) return;
    const reduce = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? true;
    section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    const heading = this.document.getElementById('notify-title');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  }
}

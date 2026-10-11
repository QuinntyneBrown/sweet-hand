import {
  ApplicationRef,
  DOCUMENT,
  Injectable,
  Injector,
  inject,
  type TemplateRef,
  type ViewContainerRef,
} from '@angular/core';
import { FocusTrapFactory, type FocusTrap } from '@angular/cdk/a11y';
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import type { ModalOptions } from './modal-options';
import type { ModalRef } from './modal-ref';

/**
 * Renders a modal template at the end of `<body>`, makes the rest of the page
 * inert, traps focus inside it, handles Escape and returns focus on close
 * (dialog and sheet CRDs; WCAG 2.4.3, L2-067.4). Overlays can stack.
 */
@Injectable({ providedIn: 'root' })
export class ModalLayer {
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  private readonly focusTraps = inject(FocusTrapFactory);
  private readonly stack: HTMLElement[] = [];

  open(template: TemplateRef<unknown>, vcr: ViewContainerRef, options: ModalOptions): ModalRef {
    const doc = this.document;
    const opener = doc.activeElement as HTMLElement | null;
    const host = doc.createElement('div');
    host.className = 'sh-modal-host';
    doc.body.appendChild(host);

    const outlet = new DomPortalOutlet(host, this.appRef, this.injector);
    outlet.attach(new TemplatePortal(template, vcr));

    const inerted: HTMLElement[] = [];
    for (const el of Array.from(doc.body.children) as HTMLElement[]) {
      if (el !== host && !el.inert && !el.classList.contains('sh-live-layer')) {
        el.inert = true;
        inerted.push(el);
      }
    }
    if (this.stack.length === 0) doc.documentElement.style.overflow = 'hidden';
    this.stack.push(host);

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.stack.at(-1) === host) {
        event.stopPropagation();
        options.onEscape();
      }
    };
    host.addEventListener('keydown', onKeydown);

    const trap: FocusTrap = this.focusTraps.create(host);
    queueMicrotask(() => {
      const target = options.initialFocus?.(host) ?? host.querySelector<HTMLElement>('[autofocus]');
      if (target) target.focus();
      else trap.focusInitialElement();
    });

    let closed = false;
    return {
      host,
      close: () => {
        if (closed) return;
        closed = true;
        host.removeEventListener('keydown', onKeydown);
        trap.destroy();
        outlet.dispose();
        host.remove();
        for (const el of inerted) el.inert = false;
        this.stack.splice(this.stack.indexOf(host), 1);
        if (this.stack.length === 0) doc.documentElement.style.overflow = '';
        const back = options.returnFocus?.() ?? opener;
        if (back && back.isConnected) back.focus();
      },
    };
  }
}

import { Injectable, signal } from '@angular/core';
import type { IconName } from '../icon/icon-name';
import type { ToastTone } from './toast-tone';
import type { ToastDismissReason } from './toast-dismiss-reason';
import type { ToastOptions } from './toast-options';
import type { ToastRef } from './toast-ref';
import type { ActiveToast } from './active-toast';

const MIN_DURATION = 8000;

/** The contract pages use to raise toasts (docs/specs/components/toast.md). */
@Injectable({ providedIn: 'root' })
export class ToastNotifier {
  private nextId = 0;
  readonly toasts = signal<ActiveToast[]>([]);
  max = 3;

  show(options: ToastOptions): ToastRef {
    const tone = options.tone ?? 'success';
    const persistent = options.persistent ?? tone === 'danger';
    let resolve!: (r: ToastDismissReason) => void;
    const dismissed = new Promise<ToastDismissReason>((r) => (resolve = r));
    const toast: ActiveToast = {
      id: ++this.nextId,
      tone,
      title: options.title,
      text: options.text ?? null,
      action: options.action ?? null,
      persistent,
      durationMs: Math.max(MIN_DURATION, options.durationMs ?? MIN_DURATION),
      restoreFocusTo: options.restoreFocusTo ?? null,
      resolve,
    };
    if (!persistent) toast.timer = setTimeout(() => this.remove(toast.id, 'timeout'), toast.durationMs);
    const list = [...this.toasts(), toast];
    // A fourth replaces the oldest auto-dismissing toast; danger and persistent ones stay.
    while (list.length > this.max) {
      const oldest = list.find((t) => !t.persistent);
      if (!oldest) break;
      list.splice(list.indexOf(oldest), 1);
      clearTimeout(oldest.timer);
      oldest.resolve('replaced');
    }
    this.toasts.set(list);
    return { dismiss: () => this.remove(toast.id, 'programmatic'), dismissed };
  }

  remove(id: number, reason: ToastDismissReason): void {
    const toast = this.toasts().find((t) => t.id === id);
    if (!toast) return;
    clearTimeout(toast.timer);
    this.toasts.set(this.toasts().filter((t) => t.id !== id));
    toast.resolve(reason);
  }
}

export const ICON: Record<ToastTone, IconName> = { info: 'info', success: 'success', warning: 'warning', danger: 'danger' };


import { afterNextRender, ChangeDetectionStrategy, Component, computed, DOCUMENT, ElementRef, inject, input } from '@angular/core';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon-name';
import { RouterLink } from '@angular/router';
import { ICON, ToastNotifier } from './toast';
import type { ToastTone } from './toast-tone';

/**
 * The live region toasts appear in, kept last in `<body>` so modal overlays
 * never make it inert. Place once in the app shell.
 */
@Component({
  selector: 'sh-toast-region',
  imports: [Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sh-live-layer', style: 'display: contents' },
  templateUrl: './toast-region.html',
})
export class ToastRegion {
  readonly placement = input<'bottom' | 'top'>('bottom');
  readonly max = input(3);
  readonly dismissLabel = input.required<string>();

  protected readonly notifier = inject(ToastNotifier);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  protected readonly maxApplied = computed(() => (this.notifier.max = this.max()));

  constructor() {
    afterNextRender(() => {
      this.maxApplied();
      this.document.body.appendChild(this.host.nativeElement);
    });
  }

  protected icon(tone: ToastTone): IconName {
    return ICON[tone];
  }

  protected act(id: number, run: (() => void) | undefined, focus: HTMLElement | null): void {
    run?.();
    this.notifier.remove(id, 'action');
    focus?.focus();
  }

  protected escape(): void {
    const last = this.notifier.toasts().at(-1);
    if (last) this.notifier.remove(last.id, 'escape');
  }
}

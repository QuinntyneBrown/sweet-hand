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
  template: `
    <div [class]="placement() === 'top' ? 'toast-region toast-region--top' : 'toast-region'" role="status" aria-live="polite" (keydown.escape)="escape()">
      @for (t of notifier.toasts(); track t.id) {
        <div [class]="'toast toast--' + t.tone" [attr.role]="t.tone === 'danger' ? 'alert' : null">
          <svg [shIcon]="icon(t.tone)"></svg>
          <div class="toast__body">
            <div class="toast__title">{{ t.title }}</div>
            @if (t.text) {
              <div class="toast__text">{{ t.text }}</div>
            }
            @if (t.action; as a) {
              <div class="toast__actions">
                @if (a.href) {
                  <a class="toast__action" [routerLink]="a.href" (click)="act(t.id, a.run, t.restoreFocusTo)">{{ a.label }}</a>
                } @else {
                  <button class="toast__action" type="button" (click)="act(t.id, a.run, t.restoreFocusTo)">{{ a.label }}</button>
                }
              </div>
            }
          </div>
          <button class="close" type="button" [attr.aria-label]="dismissLabel()" (click)="notifier.remove(t.id, 'dismiss')"><svg shIcon="close"></svg></button>
          @if (!t.persistent) {
            <span class="toast__progress" aria-hidden="true" [style.width.%]="100"></span>
          }
        </div>
      }
    </div>
  `,
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

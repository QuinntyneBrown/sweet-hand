import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  Injectable,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon, type IconName } from '../icon/icon';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';
export type ToastDismissReason = 'timeout' | 'dismiss' | 'escape' | 'action' | 'replaced' | 'programmatic';

export interface ToastOptions {
  tone?: ToastTone;
  title: string;
  text?: string | null;
  action?: { label: string; href?: string; run?: () => void } | null;
  persistent?: boolean;
  durationMs?: number;
  restoreFocusTo?: HTMLElement | null;
}

export interface ToastRef {
  dismiss(): void;
  readonly dismissed: Promise<ToastDismissReason>;
}

interface ActiveToast extends Required<Pick<ToastOptions, 'title'>> {
  id: number;
  tone: ToastTone;
  text: string | null;
  action: ToastOptions['action'];
  persistent: boolean;
  durationMs: number;
  restoreFocusTo: HTMLElement | null;
  resolve: (reason: ToastDismissReason) => void;
  timer?: ReturnType<typeof setTimeout>;
}

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

const ICON: Record<ToastTone, IconName> = { info: 'info', success: 'success', warning: 'warning', danger: 'danger' };

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

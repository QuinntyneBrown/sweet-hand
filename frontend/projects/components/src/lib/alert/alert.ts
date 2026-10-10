import { ChangeDetectionStrategy, Component, DOCUMENT, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { Icon, type IconName } from '../icon/icon';

/**
 * A message about the page or what just happened (docs/specs/components/alert.md).
 * Colour is never the only signal: every tone has its icon and a title (L2-069.5).
 */
@Component({
  selector: 'sh-alert',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (!gone()) {
      <div [class]="cls()" [attr.role]="role()">
        <svg [shIcon]="icon()"></svg>
        <div class="alert__body">
          @if (banner()) {
            <span #titleEl class="alert__title">{{ title() }}</span> <span><ng-content /></span>
          } @else {
            <p #titleEl class="alert__title">{{ title() }}</p>
            <p><ng-content /></p>
          }
          <ng-content select="[slot=actions]" />
        </div>
        @if (dismissible() && tone() !== 'danger') {
          <button class="icon-btn alert__dismiss" type="button" [attr.aria-label]="dismissLabel()" (click)="dismiss()"><svg shIcon="close"></svg></button>
        }
      </div>
    }
  `,
})
export class Alert {
  readonly tone = input<'info' | 'success' | 'warning' | 'danger'>('info');
  readonly title = input.required<string>();
  readonly banner = input(false);
  readonly live = input<'assertive' | 'polite' | 'off'>('off');
  readonly dismissible = input(false);
  readonly dismissLabel = input<string | null>(null);

  readonly dismissed = output<void>();

  protected readonly gone = signal(false);
  private readonly titleEl = viewChild<ElementRef<HTMLElement>>('titleEl');
  private readonly document = inject(DOCUMENT);

  protected readonly cls = computed(() => ['alert', this.tone() !== 'info' && `alert--${this.tone()}`, this.banner() && 'banner'].filter(Boolean).join(' '));
  protected readonly role = computed(() => (this.live() === 'assertive' ? 'alert' : this.live() === 'polite' ? 'status' : null));
  protected readonly icon = computed<IconName>(() => this.tone());

  focusTitle(): void {
    const el = this.titleEl()?.nativeElement;
    if (!el) return;
    el.setAttribute('tabindex', '-1');
    el.focus();
  }

  protected dismiss(): void {
    this.gone.set(true);
    this.dismissed.emit();
    this.document.getElementById('main')?.focus();
  }
}

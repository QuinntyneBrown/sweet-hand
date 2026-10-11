import { ChangeDetectionStrategy, Component, ElementRef, input, output, signal, viewChild } from '@angular/core';

/**
 * System pages: not found, no access, server error, rate limited, offline and
 * maintenance (docs/specs/components/error-page.md). Holds no strings of its own.
 */
@Component({
  selector: 'sh-error-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div class="container">
      <div class="system-page">
        <div class="photo-row" aria-hidden="true"><ng-content select="[slot=photos]" /></div>
        <h1 #headingEl tabindex="-1">{{ heading() }}</h1>
        <p class="prose">{{ text() }}</p>
        <div class="system-page__actions"><ng-content select="[slot=actions]" /></div>
        <p class="visually-hidden" role="status">{{ copied() ? copiedLabel() : statusMessage() }}</p>
        @if (reference()) {
          <p class="system-page__code">
            {{ referenceLabel() }} <code>{{ reference() }}</code>
            <button class="btn btn--link btn--sm" type="button" [attr.aria-label]="copyAriaLabel()" (click)="copy()">{{ copyLabel() }}</button>
          </p>
        } @else if (code()) {
          <p class="system-page__code">{{ code() }}</p>
        }
      </div>
    </div>
  `,
})
export class ErrorPage {
  readonly heading = input.required<string>();
  readonly text = input.required<string>();
  readonly code = input<string | null>(null);
  readonly reference = input<string | null>(null);
  readonly referenceLabel = input<string | null>(null);
  readonly copyLabel = input<string | null>(null);
  readonly copyAriaLabel = input<string | null>(null);
  readonly copiedLabel = input<string | null>(null);
  readonly statusMessage = input('');

  readonly referenceCopied = output<string>();

  protected readonly copied = signal(false);
  private readonly headingEl = viewChild.required<ElementRef<HTMLElement>>('headingEl');

  focusHeading(): void {
    this.headingEl().nativeElement.focus();
  }

  protected async copy(): Promise<void> {
    const ref = this.reference();
    if (!ref) return;
    try {
      await navigator.clipboard.writeText(ref);
    } catch {
      return; // The reference stays selectable (D-6).
    }
    this.copied.set(true);
    this.referenceCopied.emit(ref);
    setTimeout(() => this.copied.set(false), 2000);
  }
}

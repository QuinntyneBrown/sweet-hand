import { ChangeDetectionStrategy, Component, ElementRef, input, output, signal, viewChild } from '@angular/core';

/**
 * System pages: not found, no access, server error, rate limited, offline and
 * maintenance (docs/specs/components/error-page.md). Holds no strings of its own.
 */
@Component({
  selector: 'sh-error-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './error-page.html',
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

import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output } from '@angular/core';

/**
 * One message in a thread: theirs, mine or a system event (docs/specs/components/message.md,
 * `sh-message`). Text is set as text only, never HTML, and never linkified (L2-032.3–4).
 * The host sits directly in the `ol`, so it is the list item; its `li` keeps the CRD markup.
 */
@Component({
  selector: 'sh-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents', role: 'listitem' },
  templateUrl: './message.html',
})
export class Message {
  readonly kind = input.required<'theirs' | 'mine' | 'system'>();
  readonly sender = input<string | null>(null);
  readonly text = input.required<string>();
  readonly time = input<string | null>(null);
  readonly datetime = input<string | null>(null);
  readonly delivery = input<'sent' | 'pending' | 'failed'>('sent');
  readonly sendingLabel = input('');
  readonly failedLabel = input('');
  readonly retryLabel = input('');

  readonly retried = output<void>();

  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  protected readonly cls = computed(() =>
    ['message', `message--${this.kind()}`, this.kind() === 'mine' && this.delivery() !== 'sent' && `message--${this.delivery()}`].filter(Boolean).join(' '),
  );
  protected readonly prefix = computed(() => `${this.sender() ?? ''}:`);

  /** Moves focus to the message, e.g. from a "Show message" toast. */
  focus(): void {
    const target = this.host.nativeElement.querySelector<HTMLElement>('.message__bubble') ?? this.host.nativeElement.querySelector<HTMLElement>('li');
    if (!target) return;
    target.setAttribute('tabindex', '-1');
    target.scrollIntoView({ block: 'center' });
    target.focus();
  }
}

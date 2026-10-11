import { ChangeDetectionStrategy, Component, ElementRef, computed, input, model, output, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';
import { Textarea, graphemeLength } from '../form/textarea';

/**
 * The sticky reply form at the end of a thread (docs/specs/components/message.md,
 * `sh-reply-box`). Validation is the consumer's; Enter adds a line, Ctrl/⌘+Enter sends.
 */
@Component({
  selector: 'sh-reply-box',
  imports: [Icon, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  // The field takes the room; Send keeps its 44 px target on phones (L2-065.1, message AC-26).
  styleUrl: './reply-box.css',
  templateUrl: './reply-box.html',
})
export class ReplyBox {
  readonly label = input.required<string>();
  readonly fieldId = input('reply');
  readonly value = model('');
  readonly maxLength = input(2000);
  readonly help = input.required<string>();
  readonly counterLabel = input.required<string>();
  readonly error = input<string | null>(null);
  readonly summaryTitle = input<string | null>(null);
  readonly sendLabel = input.required<string>();
  readonly sendStyle = input<'icon' | 'text'>('icon');
  readonly busy = input(false);

  readonly submitted = output<string>();

  private readonly field = viewChild.required<Textarea>('field');
  private readonly summary = viewChild<ElementRef<HTMLElement>>('summary');

  protected readonly over = computed(() => graphemeLength(this.value()) > this.maxLength());
  protected readonly describedBy = computed(() => `${this.fieldId()}-${this.error() ? 'error' : 'help'} ${this.fieldId()}-count`);

  focusField(): void {
    this.field().focus();
  }

  focusSummary(): void {
    this.summary()?.nativeElement.focus();
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.send();
  }

  protected send(): void {
    if (!this.busy()) this.submitted.emit(this.value());
  }

  protected goToField(event: Event): void {
    event.preventDefault();
    this.focusField();
  }
}

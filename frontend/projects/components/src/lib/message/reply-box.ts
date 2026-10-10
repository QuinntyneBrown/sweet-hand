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
  template: `
    <form class="reply-box" novalidate (submit)="onSubmit($event)">
      @if (error() && summaryTitle()) {
        <div #summary class="form-summary" role="alert" tabindex="-1" [id]="fieldId() + '-summary'">
          <h3>{{ summaryTitle() }}</h3>
          <ul>
            <li><a [href]="'#' + fieldId()" (click)="goToField($event)">{{ error() }}</a></li>
          </ul>
        </div>
      }
      <label class="reply-box__label" [for]="fieldId()">{{ label() }}</label>
      <div class="reply-box__row">
        <sh-textarea
          #field
          variant="reply"
          [inputId]="fieldId()"
          [name]="fieldId()"
          [rows]="2"
          [(value)]="value"
          [readonly]="busy()"
          [invalid]="!!error()"
          [describedBy]="describedBy()"
          (submitRequested)="send()"
        />
        @if (sendStyle() === 'icon') {
          <button class="btn btn--primary btn--icon" type="submit" [attr.aria-label]="sendLabel()" [attr.aria-busy]="busy() ? 'true' : null" [attr.aria-disabled]="busy() ? 'true' : null">
            <svg shIcon="send"></svg>
          </button>
        } @else {
          <button class="btn btn--primary" type="submit" [attr.aria-busy]="busy() ? 'true' : null" [attr.aria-disabled]="busy() ? 'true' : null"><svg shIcon="send"></svg>{{ sendLabel() }}</button>
        }
      </div>
      <span class="cluster cluster--between">
        @if (error()) {
          <span class="field__error" [id]="fieldId() + '-error'">{{ error() }}</span>
        } @else {
          <span class="field__help" [id]="fieldId() + '-help'">{{ help() }}</span>
        }
        <span class="field__counter" [id]="fieldId() + '-count'" [attr.data-over]="over() ? '' : null">{{ counterLabel() }}</span>
      </span>
    </form>
  `,
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

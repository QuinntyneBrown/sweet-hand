import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatusTone =
  | 'open'
  | 'replied'
  | 'published'
  | 'pending'
  | 'held'
  | 'hidden'
  | 'declined'
  | 'suspended'
  | 'changes'
  | 'closed'
  | 'removed'
  | 'draft';

/**
 * A state word with a shape that is never the only signal (docs/specs/components/status.md,
 * L2-069.5). The modifier names a shape and tone, not a record type.
 */
@Component({
  selector: 'sh-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (skeleton()) {
      <span class="skeleton skeleton--text" style="width: 5rem" aria-hidden="true"></span>
    } @else if (block()) {
      <p [class]="cls()">{{ text() }}</p>
    } @else {
      <span [class]="cls()">{{ text() }}</span>
    }
  `,
})
export class Status {
  readonly tone = input<StatusTone | null>(null);
  readonly label = input('');
  readonly detail = input<string | null>(null);
  readonly block = input(false);
  readonly extraClass = input<string | null>(null);
  readonly skeleton = input(false);

  protected readonly cls = computed(() => ['status', this.tone() && `status--${this.tone()}`, this.extraClass()].filter(Boolean).join(' '));
  protected readonly text = computed(() => (this.detail() ? `${this.label()} · ${this.detail()}` : this.label()));
}

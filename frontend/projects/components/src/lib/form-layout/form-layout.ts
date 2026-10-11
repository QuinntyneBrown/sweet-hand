import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

let nextId = 0;

/**
 * A group of related controls with its question as the legend
 * (docs/specs/components/form-layout.md, `sh-fieldset`). One help line and one
 * group error serve every control in it.
 */
@Component({
  selector: 'sh-fieldset',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './form-layout.html',
})
export class Fieldset {
  readonly legend = input.required<string>();
  readonly legendHeading = input<'h2' | 'h3' | null>(null);
  readonly optionalMarker = input<string | null>(null);
  readonly help = input<string | null>(null);
  readonly error = input<string | null>(null);
  /** The prefix of the help and error ids ("occasions" gives `occasions-error`). */
  readonly fieldId = input<string | null>(null);

  private readonly generated = `sh-fieldset-${++nextId}`;
  protected readonly id = computed(() => this.fieldId() ?? this.generated);
  protected readonly describedBy = computed(() => [this.error() && `${this.id()}-error`, this.help() && `${this.id()}-help`].filter(Boolean).join(' ') || null);
}


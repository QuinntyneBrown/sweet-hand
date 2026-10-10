import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FIELD_CONTEXT } from '../form/form-field';
import { Icon } from '../icon/icon';

export interface AreaOption {
  value: string;
  label: string;
  region: string;
}

let nextId = 0;

/** Case- and accent-insensitive "contains" (L2-011.3). */
export function foldText(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * The area or postal code combobox (docs/specs/components/combobox.md):
 * suggests matching areas as people type; Enter with no active option submits
 * the enclosing form.
 */
@Component({
  selector: 'sh-combobox',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div class="search-field">
      <svg shIcon="pin"></svg>
      <input
        #input
        class="input"
        [id]="id()"
        type="search"
        [attr.name]="name()"
        [value]="value()"
        [attr.placeholder]="placeholder()"
        autocomplete="postal-code"
        autocapitalize="characters"
        enterkeyhint="search"
        spellcheck="false"
        role="combobox"
        aria-autocomplete="list"
        [attr.aria-controls]="listId"
        [attr.aria-expanded]="expanded()"
        [attr.aria-activedescendant]="activeId()"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.aria-describedby]="field?.describedBy() ?? null"
        [readOnly]="readonly()"
        [disabled]="disabled()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (blur)="onBlur($event)"
      />
    </div>
    <ul [class]="suggestions() === 'inline' ? 'suggestions suggestions--inline' : 'suggestions'" [id]="listId" role="listbox" [attr.aria-label]="listLabel()" [hidden]="!expanded()">
      @for (o of matches(); track o.value; let i = $index) {
        <li class="suggestion" [id]="optionId(o)" role="option" [attr.aria-selected]="i === active()" (pointerdown)="$event.preventDefault()" (click)="choose(o)">
          <span>{{ before(o) }}<mark>{{ marked(o) }}</mark>{{ after(o) }}</span><span class="visually-hidden">, </span><span class="suggestion__hint">{{ o.region }}</span>
        </li>
      }
    </ul>
    @if (showNoMatch()) {
      <p class="suggestions suggestions__empty" role="status">{{ noMatchText() }}</p>
    }
    <span class="visually-hidden" role="status">{{ announcement() }}</span>
  `,
})
export class Combobox {
  readonly areas = input.required<readonly AreaOption[]>();
  readonly value = model('');
  readonly suggestions = input<'raised' | 'inline'>('raised');
  readonly name = input<string | null>('area');
  readonly placeholder = input<string | null>(null);
  readonly listLabel = input.required<string>();
  readonly noMatchText = input.required<string>();
  readonly matchCountText = input.required<(count: number) => string>();
  readonly maxSuggestions = input(8);
  readonly readonly = input(false);
  readonly disabled = input(false);
  readonly autofocus = input(false);
  readonly invalid = input<boolean | null>(null);
  readonly errorAnnouncement = input<string | null>(null);

  readonly areaChosen = output<AreaOption>();
  readonly blurred = output<FocusEvent>();

  protected readonly field = inject(FIELD_CONTEXT, { optional: true });
  private readonly inputEl = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly generated = `sh-combobox-${++nextId}`;
  protected readonly listId = `${this.generated}-list`;
  protected readonly id = computed(() => this.field?.id() ?? this.generated);
  protected readonly isInvalid = computed(() => this.invalid() ?? this.field?.invalid() ?? false);
  private readonly open = signal(false);
  protected readonly active = signal(-1);

  private readonly query = computed(() => foldText(this.value().trim()));
  /** Text that looks like a postal code is not matched against area names. */
  private readonly looksLikePostal = computed(() => /\d/.test(this.value()));
  protected readonly matches = computed(() => {
    const q = this.query();
    if (!q || this.looksLikePostal()) return [];
    return this.areas()
      .filter((a) => foldText(a.label).includes(q))
      .slice(0, this.maxSuggestions());
  });
  protected readonly expanded = computed(() => this.open() && !this.readonly() && this.matches().length > 0);
  protected readonly showNoMatch = computed(() => this.open() && !this.readonly() && !!this.query() && !this.looksLikePostal() && this.matches().length === 0);
  protected readonly activeId = computed(() => (this.expanded() && this.active() >= 0 ? this.optionId(this.matches()[this.active()]) : null));
  protected readonly announcement = computed(() => this.errorAnnouncement() ?? (this.expanded() ? this.matchCountText()(this.matches().length) : ''));

  constructor() {
    afterNextRender(() => {
      if (this.autofocus()) this.inputEl().nativeElement.focus();
    });
  }

  focus(options?: FocusOptions): void {
    this.inputEl().nativeElement.focus(options);
  }

  close(): void {
    this.open.set(false);
    this.active.set(-1);
  }

  protected optionId(o: AreaOption | undefined): string {
    return o ? `${this.generated}-opt-${o.value}` : '';
  }

  private range(o: AreaOption): [number, number] {
    const i = foldText(o.label).indexOf(this.query());
    return [i, i + this.query().length];
  }
  protected before(o: AreaOption) {
    return o.label.slice(0, this.range(o)[0]);
  }
  protected marked(o: AreaOption) {
    const [a, b] = this.range(o);
    return o.label.slice(a, b);
  }
  protected after(o: AreaOption) {
    return o.label.slice(this.range(o)[1]);
  }

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
    this.open.set(true);
    this.active.set(-1);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const n = this.matches().length;
    if (event.key === 'ArrowDown' && n) {
      event.preventDefault();
      this.open.set(true);
      this.active.set((this.active() + 1) % n);
    } else if (event.key === 'ArrowUp' && n) {
      event.preventDefault();
      this.open.set(true);
      this.active.set(this.active() <= 0 ? n - 1 : this.active() - 1);
    } else if (event.key === 'Enter' && this.expanded() && this.active() >= 0) {
      event.preventDefault();
      this.choose(this.matches()[this.active()]);
    } else if (event.key === 'Escape' && this.expanded()) {
      event.preventDefault();
      event.stopPropagation();
      this.close();
    }
  }

  protected onBlur(event: FocusEvent): void {
    this.close();
    this.blurred.emit(event);
  }

  protected choose(o: AreaOption): void {
    this.value.set(o.label);
    this.close();
    this.areaChosen.emit(o);
  }
}

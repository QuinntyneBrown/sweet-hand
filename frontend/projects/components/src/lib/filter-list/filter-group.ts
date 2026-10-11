import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { optionDisabled, type FilterOption } from './filter-option';

let nextId = 0;

/**
 * A titled filter group of the listing column: optional "All", toggle options
 * with counts and the More toggle (docs/specs/components/filter-list.md).
 * The area search goes in `[slot=before-list]`.
 */
@Component({
  selector: 'sh-filter-group',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The title input must not become a tooltip on the host.
  host: { style: 'display: contents', '[attr.title]': 'null' },
  template: `
    <div class="filter-group" role="group" [attr.aria-labelledby]="titleId">
      <h2 class="filter-group__title" [id]="titleId">{{ title() }}</h2>
      <ng-content select="[slot=before-list]" />
      <ul class="filter-list" [id]="listId">
        @if (allLabel()) {
          <li>
            <a class="filter-list__item" [routerLink]="allTree()" [attr.aria-current]="noneChosen() ? 'true' : null">{{ allLabel() }}</a>
          </li>
        }
        @for (o of visible(); track o.value) {
          <li>
            <button
              class="filter-list__item"
              type="button"
              [attr.aria-pressed]="o.pressed"
              [disabled]="isDisabled(o) && focused() !== o.value"
              [attr.aria-disabled]="isDisabled(o) && focused() === o.value ? 'true' : null"
              (focus)="focused.set(o.value)"
              (blur)="focused.set(null)"
              (click)="toggle(o)"
            >
              {{ o.label }}
              @if (o.count !== null) {
                <span class="filter-list__count">{{ o.count }}<span class="visually-hidden">{{ countNoun()(o.count) }}</span></span>
              }
            </button>
          </li>
        }
      </ul>
      @if (hiddenCount() > 0 || expanded()) {
        <button class="filter-more" type="button" [attr.aria-expanded]="expanded()" [attr.aria-controls]="listId" [disabled]="disabled()" (click)="toggleMore()">
          {{ expanded() ? fewerLabel() : moreLabel()!(hiddenCount()) }}
        </button>
      }
    </div>
  `,
})
export class FilterGroup {
  readonly title = input.required<string>();
  readonly allLabel = input<string | null>(null);
  readonly allHref = input<string | null>(null);
  readonly options = input.required<FilterOption[]>();
  readonly visibleCount = input(6);
  readonly moreLabel = input<((hidden: number) => string) | null>(null);
  readonly fewerLabel = input<string | null>(null);
  readonly countNoun = input.required<(count: number) => string>();
  readonly disabled = input(false);

  readonly toggled = output<{ value: string; pressed: boolean }>();
  readonly expandedChange = output<boolean>();

  private readonly router = inject(Router);
  private readonly id = ++nextId;
  protected readonly titleId = `sh-fg-${this.id}-title`;
  protected readonly listId = `sh-fg-${this.id}-list`;
  protected readonly expanded = signal(false);
  /** The option that has focus keeps it when a recount disables it (D-5). */
  protected readonly focused = signal<string | null>(null);

  protected readonly noneChosen = computed(() => !this.options().some((o) => o.pressed));
  protected readonly allTree = computed(() => (this.allHref() ? this.router.parseUrl(this.allHref()!) : null));
  /** Chosen options are always shown, even beyond the first few (D-4). */
  protected readonly visible = computed(() =>
    this.expanded() || !this.moreLabel() ? this.options() : this.options().filter((o, i) => i < this.visibleCount() || o.pressed),
  );
  protected readonly hiddenCount = computed(() => (this.expanded() ? 0 : this.options().length - this.visible().length));

  protected isDisabled(o: FilterOption): boolean {
    return optionDisabled(o, this.disabled());
  }

  protected toggle(o: FilterOption): void {
    if (this.isDisabled(o)) return;
    this.toggled.emit({ value: o.value, pressed: !o.pressed });
  }

  protected toggleMore(): void {
    this.expanded.update((v) => !v);
    this.expandedChange.emit(this.expanded());
  }
}

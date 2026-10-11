import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  contentChildren,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';

export type ListFamily = 'list' | 'device' | 'settings' | 'editable' | 'breach';

const LIST_CLASS: Record<ListFamily, string> = {
  list: 'list',
  device: 'list device-list',
  settings: 'admin-list',
  editable: 'edit-list',
  breach: 'breach-list',
};

/**
 * Rows of settings and records: device, settings, editable and breach lists
 * (docs/specs/components/list.md). Rows are the `li[sh-…]` row components of
 * the same family, so the list's children stay `li` elements.
 */
@Component({
  selector: 'sh-list',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  template: `
    @if (isOrdered()) {
      <ol #listEl [class]="listClass()" [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="busy() ? null : labelledBy()" [attr.aria-busy]="busy() ? 'true' : null">
        <ng-container *ngTemplateOutlet="rows" />
      </ol>
    } @else {
      <ul #listEl [class]="listClass()" [attr.aria-label]="ariaLabel()" [attr.aria-labelledby]="busy() ? null : labelledBy()" [attr.aria-busy]="busy() ? 'true' : null">
        <ng-container *ngTemplateOutlet="rows" />
      </ul>
    }
    <p class="visually-hidden" role="status">{{ busy() ? busyLabel() : (announcement() ?? '') }}</p>
    <ng-template #rows>
      @if (busy()) {
        @for (i of skeletons(); track i) {
          @switch (family()) {
            @case ('settings') {
              <li class="admin-row admin-row--skeleton" aria-hidden="true">
                @if (skeletonAvatar()) {
                  <span class="avatar skeleton skeleton--circle"></span>
                }
                <span class="admin-row__body"><span class="skeleton skeleton--title"></span><span class="skeleton skeleton--text"></span></span>
                @if (hasSkeletonAction()) {
                  <span class="admin-row__actions"><span class="skeleton skeleton--rect"></span></span>
                }
              </li>
            }
            @case ('editable') {
              <li class="edit-row edit-row--skeleton" aria-hidden="true">
                <div class="edit-row__body"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></div>
              </li>
            }
            @case ('breach') {
              <li class="breach" aria-hidden="true"><span class="skeleton skeleton--title"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--rect"></span></li>
            }
            @default {
              <li class="list__item" aria-hidden="true">
                <div class="list__body"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></div>
              </li>
            }
          }
        }
      } @else {
        <ng-content />
      }
    </ng-template>
  `,
})
export class List {
  readonly family = input<ListFamily>('list');
  readonly ordered = input<boolean | null>(null);
  readonly label = input<string | null>(null);
  readonly labelledBy = input<string | null>(null);
  readonly busy = input(false);
  readonly busyLabel = input<string>('');
  readonly skeletonCount = input(3);
  readonly skeletonAvatar = input(false);
  readonly skeletonAction = input<boolean | null>(null);
  readonly announcement = input<string | null>(null);

  private readonly listEl = viewChild<ElementRef<HTMLElement>>('listEl');

  protected readonly isOrdered = computed(() => this.ordered() ?? this.family() === 'editable');
  protected readonly listClass = computed(() => LIST_CLASS[this.family()]);
  protected readonly ariaLabel = computed(() => (this.busy() ? this.busyLabel() : this.label()));
  protected readonly skeletons = computed(() => Array.from({ length: Math.min(20, Math.max(1, Math.round(this.skeletonCount()))) }, (_, i) => i));
  protected readonly hasSkeletonAction = computed(() => this.skeletonAction() ?? this.family() === 'settings');

  /** Focuses the first enabled control of row `index`, or the list's heading past the end (D-6). */
  focusItem(index: number): void {
    const rows = Array.from(this.listEl()?.nativeElement.children ?? []) as HTMLElement[];
    const row = rows[index];
    if (row) {
      const control = row.querySelector<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
      control?.focus();
      return;
    }
    const heading = this.labelledBy() ? document.getElementById(this.labelledBy()!) : null;
    if (heading) {
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }
}

/**
 * A title-and-meta row with an optional trailing button or status
 * (list CRD, `sh-list-item`). Used as an attribute on the `li`.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-list-item]',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.list__item]': '!href()' },
  template: `
    @if (href(); as link) {
      <a class="list__item list__item--interactive" [routerLink]="link" [attr.aria-current]="current() ? 'true' : null"
        ><span class="list__body"
          ><span class="list__title">{{ title() }}</span>
          @if (meta()) {
            <span class="list__meta">{{ meta() }}</span>
          }</span
        ><svg shIcon="chevron-right"></svg
      ></a>
    } @else {
      <div class="list__body">
        <div class="list__title">{{ title() }}</div>
        @if (meta()) {
          <div class="list__meta">{{ meta() }}</div>
        }
      </div>
      <ng-content select="[slot=end]" />
    }
  `,
})
export class ListItem {
  readonly title = input.required<string>();
  readonly meta = input<string | null>(null);
  readonly href = input<string | null>(null);
  readonly current = input(false);
}

/** A settings row: cuisines, operators (list CRD, `sh-admin-row`). Used as an attribute on the `li`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-admin-row]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'admin-row' },
  template: `
    @if (initials()) {
      <span class="avatar" aria-hidden="true">{{ initials() }}</span>
    }
    <span class="admin-row__body">
      <span class="admin-row__title">{{ title() }} <ng-content select="[slot=badge]" /></span>
      @if (meta()) {
        <span class="admin-row__meta">{{ meta() }}</span>
      }
    </span>
    @if (actions().length) {
      <span class="admin-row__actions"><ng-content select="[slot=actions]" /></span>
    }
  `,
})
export class AdminRow {
  readonly title = input.required<string>();
  readonly meta = input<string | null>(null);
  readonly initials = input<string | null>(null);

  protected readonly actions = contentChildren(Button, { descendants: true });
}

/** A dish in the menu manager with move, edit and remove (list CRD, `sh-edit-row`). Used as an attribute on the `li`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-edit-row]',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'edit-row' },
  template: `
    <div class="edit-row__body"><ng-content /></div>
    @if (!readOnly()) {
      <div class="edit-row__actions">
        <button #up class="icon-btn" type="button" [attr.aria-label]="moveUpLabel()" [attr.aria-disabled]="first() ? 'true' : null" (click)="!first() && movedUp.emit()">
          <svg shIcon="arrow-up"></svg>
        </button>
        <button #down class="icon-btn" type="button" [attr.aria-label]="moveDownLabel()" [attr.aria-disabled]="last() ? 'true' : null" (click)="!last() && movedDown.emit()">
          <svg shIcon="arrow-down"></svg>
        </button>
        <button class="icon-btn" type="button" aria-haspopup="dialog" [attr.aria-label]="editLabel()" (click)="editRequested.emit()"><svg shIcon="edit"></svg></button>
        <button class="icon-btn" type="button" aria-haspopup="dialog" [attr.aria-label]="removeLabel()" (click)="removeRequested.emit()"><svg shIcon="trash"></svg></button>
      </div>
    }
  `,
})
export class EditRow {
  readonly name = input.required<string>();
  readonly first = input(false);
  readonly last = input(false);
  readonly readOnly = input(false);
  readonly moveUpLabel = input<string>('');
  readonly moveDownLabel = input<string>('');
  readonly editLabel = input<string>('');
  readonly removeLabel = input<string>('');

  readonly movedUp = output<void>();
  readonly movedDown = output<void>();
  readonly editRequested = output<void>();
  readonly removeRequested = output<void>();

  private readonly up = viewChild<ElementRef<HTMLButtonElement>>('up');
  private readonly down = viewChild<ElementRef<HTMLButtonElement>>('down');

  focusMove(direction: 'up' | 'down'): void {
    (direction === 'up' ? this.up() : this.down())?.nativeElement.focus();
  }
}

/** A record in the privacy breach register (list CRD, `sh-breach-record`). Used as an attribute on the `li`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-breach-record]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'breach' },
  template: `
    <div class="breach__head">
      @switch (headingLevel()) {
        @case (3) {
          <h3 class="breach__title">{{ title() }}</h3>
        }
        @case (4) {
          <h4 class="breach__title">{{ title() }}</h4>
        }
        @default {
          <h2 class="breach__title">{{ title() }}</h2>
        }
      }
      <p class="breach__when">{{ when() }}</p>
    </div>
    <ng-content />
  `,
})
export class BreachRecord {
  readonly title = input.required<string>();
  readonly headingLevel = input<2 | 3 | 4>(2);
  readonly when = input.required<string>();
}

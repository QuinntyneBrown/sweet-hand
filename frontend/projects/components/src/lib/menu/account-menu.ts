import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChildren,
  Injector,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import type { MenuItemEntry } from './menu-item-entry';

/**
 * The avatar's account menu (docs/specs/components/menu.md, `sh-account-menu`).
 * `role="menu"` with roving focus: arrows, Home and End move; Escape, Tab, an
 * outside click or a choice close it.
 */
@Component({
  selector: 'sh-account-menu',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './account-menu.html',
})
export class AccountMenu {
  readonly name = input.required<string>();
  readonly secondLine = input.required<string>();
  readonly initials = input.required<string>();
  readonly items = input.required<MenuItemEntry[]>();
  readonly open = input(false);
  /** The avatar button, for focus return and outside-click detection. */
  readonly trigger = input<HTMLElement | null>(null);

  readonly openChange = output<boolean>();
  readonly itemActivated = output<{ id: string; event: Event }>();

  protected readonly nameId = 'sh-account-menu-name';
  private readonly entries = viewChildren<ElementRef<HTMLElement>>('entry');
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  private readonly outside = (event: Event) => {
    const target = event.target as Node;
    if (this.host.nativeElement.contains(target) || this.trigger()?.contains(target)) return;
    this.openChange.emit(false);
  };

  constructor() {
    effect(() => {
      if (this.open()) {
        untracked(() => {
          afterNextRender(() => this.focusAt(0), { injector: this.injector });
          this.document.addEventListener('pointerdown', this.outside, true);
        });
      } else {
        this.document.removeEventListener('pointerdown', this.outside, true);
      }
    });
  }

  close(returnFocus = true): void {
    this.openChange.emit(false);
    if (returnFocus) this.trigger()?.focus();
  }

  protected choose(item: MenuItemEntry, event: Event): void {
    this.itemActivated.emit({ id: item.id, event });
    this.openChange.emit(false);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const list = this.entries().map((e) => e.nativeElement);
    const index = list.indexOf(this.document.activeElement as HTMLElement);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusAt((index + 1) % list.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusAt((index - 1 + list.length) % list.length);
        break;
      case 'Home':
        event.preventDefault();
        this.focusAt(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusAt(list.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.openChange.emit(false);
        break;
      case ' ':
        if (list[index]?.tagName === 'A') {
          event.preventDefault();
          list[index].click();
        }
        break;
    }
  }

  private focusAt(i: number): void {
    const list = this.entries().map((e) => e.nativeElement);
    list.forEach((el, j) => el.setAttribute('tabindex', j === i ? '0' : '-1'));
    list[i]?.focus();
  }
}

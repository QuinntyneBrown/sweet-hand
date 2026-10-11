import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal, viewChild, viewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BackLink, Dish, EMPTY_STATE, EditRow, Icon, SaveStatus, Status, ToastNotifier, type DietaryTag } from '@sweet-hand/components';
import { DIETARY_LABELS } from '../../discovery/caterer/dietary-labels';
import { DashboardLayout } from '../shared/dashboard-layout';
import { ListingPreview } from '../shared/listing-preview';
import { ProfileData } from '../shared/profile-data';
import { StatusNotice } from '../shared/status-notice';
import { WithdrawDialog } from '../shared/withdraw-dialog';
import { DishDialog } from './dish.dialog';
import { RemoveDishDialog } from './remove-dish.dialog';
import { CatererProfileService, type OwnProfileView } from '@sweet-hand/api';

const MAX_DISHES = 50;
const MIN_PUBLISHED_DISHES = 3;

/** Menu, /dashboard/profile/menu (docs/mocks/pages/profile-menu; manage-menu design, L2-043). */
@Component({
  selector: 'app-menu-page',
  imports: [RouterLink, BackLink, Dish, EMPTY_STATE, EditRow, Icon, SaveStatus, Status, DashboardLayout, DishDialog, ListingPreview, RemoveDishDialog, StatusNotice, WithdrawDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu.page.html',
})
export class MenuPage {
  private readonly api = inject(CatererProfileService);
  private readonly toasts = inject(ToastNotifier);
  private readonly injector = inject(Injector);
  protected readonly data = new ProfileData(this.api);

  private readonly rows = viewChildren(EditRow);
  private readonly addButton = viewChild<ElementRef<HTMLButtonElement>>('addButton');

  protected readonly tagLabels: Record<DietaryTag, string> = DIETARY_LABELS;
  protected readonly withdrawOpen = signal(false);
  /** 'new' for Add a dish, a dish id to edit, or null. */
  protected readonly editing = signal<string | null>(null);
  protected readonly removeId = signal<string | null>(null);
  protected readonly opener = signal<HTMLElement | null>(null);

  protected readonly dishes = computed(() => this.data.profile()?.dishes ?? []);
  protected readonly full = computed(() => this.dishes().length >= MAX_DISHES);
  protected readonly subtitle = computed(() => {
    const n = this.dishes().length;
    if (!n && !this.data.readOnly()) return $localize`:@@menu.subtitleEmpty:List 3 to 50 dishes, in the order you want them shown.`;
    if (this.full()) return $localize`:@@menu.subtitleFull:50 of 50 dishes · shown in this order on your page`;
    return n === 1 ? $localize`:@@menu.subtitleOne:1 dish · shown in this order on your page` : $localize`:@@menu.subtitle:${n}:count: dishes · shown in this order on your page`;
  });
  protected readonly editedDish = computed(() => this.dishes().find((d) => d.id === this.editing()) ?? null);
  protected readonly editedPosition = computed(() => this.dishes().findIndex((d) => d.id === this.editing()) + 1);
  protected readonly removing = computed(() => this.dishes().find((d) => d.id === this.removeId()) ?? null);
  protected readonly removeBlocked = computed(() => this.data.published() && this.dishes().length <= MIN_PUBLISHED_DISHES);
  protected readonly previewLabel = computed(() => this.data.previewLabel($localize`:@@preview.yourCard:Your listing card`));
  protected readonly previewHref = computed(() => (this.data.published() ? this.data.pageHref() : null));

  protected readonly moveUp = (name: string) => $localize`:@@menu.moveUp:Move ${name}:name: up`;
  protected readonly moveDown = (name: string) => $localize`:@@menu.moveDown:Move ${name}:name: down`;
  protected readonly editLabel = (name: string) => $localize`:@@menu.edit:Edit ${name}:name:`;
  protected readonly removeLabel = (name: string) => $localize`:@@menu.remove:Remove ${name}:name:`;

  constructor() {
    void this.data.load();
  }

  protected reload(): void {
    void this.data.load();
  }

  protected openAdd(): void {
    this.opener.set(document.activeElement as HTMLElement | null);
    this.editing.set('new');
  }

  protected openEdit(id: string): void {
    this.opener.set(document.activeElement as HTMLElement | null);
    this.editing.set(id);
  }

  protected openRemove(id: string): void {
    this.opener.set(document.activeElement as HTMLElement | null);
    this.removeId.set(id);
  }

  protected saved(profile: OwnProfileView): void {
    this.data.profile.set(profile);
    this.editing.set(null);
  }

  protected removed(profile: OwnProfileView): void {
    const index = this.dishes().findIndex((d) => d.id === this.removeId());
    this.data.profile.set(profile);
    this.removeId.set(null);
    // Focus moves to the next row's Edit, or Add dish (list CRD D-6).
    afterNextRender(() => {
      const row = this.rows()[Math.min(index, this.rows().length - 1)];
      if (row) row.focusMove('up');
      else this.addButton()?.nativeElement.focus();
    }, { injector: this.injector });
  }

  /** "Add a dish" from the blocked removal opens the dish dialog. */
  protected addFromBlocked(): void {
    this.removeId.set(null);
    this.editing.set('new');
  }

  private moveSeq = 0;

  /** Move up and Move down only, never dragging (manage-menu, L2-042.1); saved in the background, latest answer wins. */
  protected async move(index: number, direction: 'up' | 'down'): Promise<void> {
    const before = this.data.profile();
    if (!before) return;
    const dishes = [...before.dishes];
    const to = direction === 'up' ? index - 1 : index + 1;
    if (to < 0 || to >= dishes.length) return;
    const [moved] = dishes.splice(index, 1);
    dishes.splice(to, 0, moved);
    this.data.profile.set({ ...before, dishes });
    afterNextRender(() => this.rows()[to]?.focusMove(direction), { injector: this.injector });
    const seq = ++this.moveSeq;
    try {
      const profile = await firstValueFrom(this.api.reorderDishes(dishes.map((d) => d.id)));
      if (seq === this.moveSeq) this.data.profile.set(profile);
    } catch {
      if (seq === this.moveSeq) void this.data.load();
      this.toasts.show({ tone: 'danger', title: $localize`:@@menu.orderFailed:Menu order not saved`, text: $localize`:@@photos.orderFailedText:Check your connection and try again.` });
    }
  }

  protected withdrawn(profile: OwnProfileView): void {
    this.data.profile.set(profile);
    this.withdrawOpen.set(false);
  }
}

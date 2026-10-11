import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminRow, Button, EmptyState, Icon, List, ToastNotifier } from '@sweet-hand/components';
import { problemOf, reference } from '../../../core/forms/problem';
import { AddCuisineDialog } from './add-cuisine.dialog';
import { cuisineMeta, cuisinesSubtitle, isNew } from './cuisines-view';
import { RetireCuisineDialog } from './retire-cuisine.dialog';
import { type CuisineUsage, type OperatorCuisine, OperatorSettingsService } from '@sweet-hand/api';
import { paths } from '../../../core/routing/paths';

/** The cuisine catalogue, /admin/cuisines (docs/mocks/pages/admin-cuisines; manage-cuisine-list, L2-007). */
@Component({
  selector: 'app-cuisines-page',
  imports: [RouterLink, AddCuisineDialog, AdminRow, Button, EmptyState, Icon, List, RetireCuisineDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cuisines.page.html',
})
export class CuisinesPage {
  protected readonly paths = paths;
  private readonly api = inject(OperatorSettingsService);
  private readonly toasts = inject(ToastNotifier);

  protected readonly cuisines = signal<OperatorCuisine[] | null>(null);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  protected readonly loading = computed(() => !this.cuisines() && !this.failure());
  protected readonly adding = signal(false);
  protected readonly retiring = signal<OperatorCuisine | null>(null);
  protected readonly retireOpen = signal(false);
  protected readonly opener = signal<HTMLElement | null>(null);
  protected readonly names = computed(() => (this.cuisines() ?? []).map((c) => c.name));
  protected readonly subtitle = computed(() => cuisinesSubtitle(this.cuisines() ?? []));
  protected readonly rows = computed(() =>
    (this.cuisines() ?? []).map((c) => ({
      ...c,
      meta: cuisineMeta(c),
      isNew: isNew(c),
      retireLabel: $localize`:@@operatorCuisines.retireNamed:Retire ${c.name}:name:`,
    })),
  );

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.failure.set(null);
    this.cuisines.set(null);
    try {
      this.cuisines.set(await firstValueFrom(this.api.cuisines()));
    } catch (error) {
      this.failure.set({ reference: reference(problemOf(error).problem) });
    }
  }

  protected openAdd(event: MouseEvent): void {
    this.opener.set(event.currentTarget as HTMLElement);
    this.adding.set(true);
  }

  protected openRetire(cuisine: OperatorCuisine, event: MouseEvent): void {
    this.opener.set(event.currentTarget as HTMLElement);
    this.retiring.set(cuisine);
    this.retireOpen.set(true);
  }

  protected added(cuisine: OperatorCuisine): void {
    this.adding.set(false);
    this.cuisines.update((all) => [...(all ?? []), cuisine].sort((a, b) => a.name.localeCompare(b.name, 'en-CA')));
    this.toasts.show({
      tone: 'success',
      title: $localize`:@@operatorCuisines.added:${cuisine.name}:name: added`,
      text: $localize`:@@addCuisine.note:Caterers can choose it straight away, and the listing filter offers it.`,
    });
  }

  /** L2-007.5: the operator sees which caterers keep the retired cuisine. */
  protected retired(usage: CuisineUsage): void {
    // The Retire button is gone; focus goes to the page heading (list D-6).
    this.opener.set(document.getElementById('cuisines-title'));
    this.retireOpen.set(false);
    this.cuisines.update((all) => (all ?? []).map((c) => (c.id === usage.cuisine.id ? usage.cuisine : c)));
    const names = usage.caterers.map((c) => c.name);
    this.toasts.show({
      tone: 'success',
      title: $localize`:@@operatorCuisines.retiredTitle:${usage.cuisine.name}:name: is retired`,
      text: names.length
        ? $localize`:@@operatorCuisines.retiredKeep:${new Intl.ListFormat('en-CA', { style: 'long', type: 'conjunction' }).format(names)}:caterers: keep it on their pages.`
        : $localize`:@@operatorCuisines.retiredUnused:It’s no longer offered in filters or profiles.`,
    });
  }
}
